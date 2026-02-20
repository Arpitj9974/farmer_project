require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cron = require('node-cron');
const logger = require('./config/logger').child('SERVER');
const pool = require('./config/database');
const { testConnection, verifySchema, gracefulShutdown, getPoolStats } = require('./config/database');
const { migrateUp } = require('./database/migrate');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const bidRoutes = require('./routes/bids');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const priceRoutes = require('./routes/prices');
const aiRoutes = require('./routes/ai');

const app = express();
const ENV = process.env.NODE_ENV || 'development';

// ═══════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── CORS — Environment-Aware ───
// In PRODUCTION: Only FRONTEND_URL is allowed (your Vercel domain)
// In DEVELOPMENT: Localhost variants are also allowed for convenience
const allowedOrigins = ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007',
        process.env.FRONTEND_URL,
    ].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, health checks)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`🚫 CORS blocked request from unauthorized origin`, { origin, allowedOrigins });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parser ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ═══════════════════════════════════════════════════
// REQUEST LOGGING — Winston-powered
// ═══════════════════════════════════════════════════

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl.startsWith('/api/')) {
            const logData = {
                action: 'HTTP_REQUEST',
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration_ms: duration,
                ip: req.ip,
            };

            // Log slow requests as warnings
            if (duration > 2000) {
                logger.warn('Slow HTTP request', logData);
            } else if (res.statusCode >= 500) {
                logger.error('Server error response', logData);
            } else if (ENV === 'development') {
                logger.info(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
            }
        }
    });
    next();
});

// Rate limiting
app.use('/api', generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/ai', aiRoutes);

// ═══════════════════════════════════════════════════
// HEALTH CHECK — with pool stats + DB ping
// ═══════════════════════════════════════════════════

app.get('/api/health', async (req, res) => {
    try {
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        const dbLatency = Date.now() - dbStart;

        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                latency_ms: dbLatency,
                pool: getPoolStats(),
            },
            environment: ENV,
            uptime_seconds: Math.floor(process.uptime()),
            memory: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
            },
        });
    } catch (err) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: { status: 'disconnected', error: err.message },
        });
    }
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// ═══════════════════════════════════════════════════
// PROCESS ERROR HANDLERS — prevent crashes
// ═══════════════════════════════════════════════════

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        action: 'UNHANDLED_REJECTION',
        reason: reason?.message || reason,
        stack: reason?.stack,
    });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        action: 'UNCAUGHT_EXCEPTION',
        errorMessage: error.message,
        stack: error.stack,
    });

    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Exiting.`);
        process.exit(1);
    }
    // For other exceptions — log but let the process stay alive
});

// ═══════════════════════════════════════════════════
// GRACEFUL SHUTDOWN — clean exit on SIGTERM/SIGINT
// ═══════════════════════════════════════════════════

let server;

async function shutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`, { action: 'SHUTDOWN' });

    // Stop accepting new connections
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed', { action: 'SHUTDOWN' });
        });
    }

    // Close DB pool
    await gracefulShutdown(signal);

    logger.info('Graceful shutdown complete', { action: 'SHUTDOWN_COMPLETE' });
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ═══════════════════════════════════════════════════
// DAILY ANALYTICS CRON — 00:30 AM IST
// ═══════════════════════════════════════════════════

cron.schedule('30 0 * * *', async () => {
    const cronLog = require('./config/logger').child('CRON');
    try {
        cronLog.info('Running daily analytics calculation...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_value,
                COALESCE(SUM(commission_amount), 0) as commission_earned,
                COALESCE(AVG(price_per_kg), 0) as avg_farmer_price,
                COUNT(DISTINCT farmer_id) as active_farmers,
                COUNT(DISTINCT buyer_id) as active_buyers
            FROM orders 
            WHERE DATE(created_at) = $1 AND order_status = 'delivered'
        `, [dateStr]);

        const failedAuctions = await pool.query(`
            SELECT COUNT(*) FROM products 
            WHERE DATE(updated_at) = $1 AND status = 'bidding_closed' 
            AND selling_mode = 'bidding'
            AND NOT EXISTS (SELECT 1 FROM orders WHERE orders.product_id = products.id)
        `, [dateStr]);

        await pool.query(`
            INSERT INTO platform_analytics (metric_date, total_orders, total_value, commission_earned, avg_farmer_price, failed_auctions, active_farmers, active_buyers)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (metric_date) DO UPDATE SET
                total_orders = EXCLUDED.total_orders,
                total_value = EXCLUDED.total_value,
                commission_earned = EXCLUDED.commission_earned,
                avg_farmer_price = EXCLUDED.avg_farmer_price,
                failed_auctions = EXCLUDED.failed_auctions,
                active_farmers = EXCLUDED.active_farmers,
                active_buyers = EXCLUDED.active_buyers
        `, [
            dateStr,
            stats.rows[0].total_orders,
            stats.rows[0].total_value,
            stats.rows[0].commission_earned,
            stats.rows[0].avg_farmer_price,
            failedAuctions.rows[0].count,
            stats.rows[0].active_farmers,
            stats.rows[0].active_buyers
        ]);

        cronLog.info(`Daily analytics calculated for ${dateStr}`);
    } catch (error) {
        cronLog.error('Daily analytics cron failed', { errorMessage: error.message });
    }
});

// ═══════════════════════════════════════════════════
// STARTUP SEQUENCE — validates everything before listening
// ═══════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

async function startServer() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🚀 FarmerConnect Backend Starting...');
    logger.info(`📍 Environment: ${ENV}`);
    logger.info(`🔌 Port: ${PORT}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // STEP 1: Test DB connection
    const dbOk = await testConnection();
    if (!dbOk) {
        logger.error('CANNOT START: Database connection failed. Check .env and PostgreSQL service.');
        process.exit(1);
    }

    // STEP 2: Run pending migrations
    try {
        const migrationResult = await migrateUp(pool);
        if (migrationResult.applied > 0) {
            logger.info(`Applied ${migrationResult.applied} migration(s)`);
        }
    } catch (err) {
        logger.error('CANNOT START: Migration failed', { errorMessage: err.message });
        process.exit(1);
    }

    // STEP 3: Verify schema integrity
    const schemaOk = await verifySchema();
    if (!schemaOk) {
        logger.error('CANNOT START: Schema verification failed. Run migrations or check database.');
        process.exit(1);
    }

    // STEP 4: Start HTTP server
    server = app.listen(PORT, () => {
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`✅ Server running on port ${PORT}`);
        logger.info(`🏥 Health: http://localhost:${PORT}/api/health`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
}

startServer();

module.exports = app;
