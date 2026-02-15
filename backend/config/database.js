const { Pool } = require('pg');
require('dotenv').config();
const logger = require('./logger').child('DB');

// ═══════════════════════════════════════════════════
// 1. ENVIRONMENT VALIDATION — crash fast on bad config
// ═══════════════════════════════════════════════════

const ENV = process.env.NODE_ENV || 'development';

// Support DATABASE_URL (production/Heroku/Render/Railway) OR individual vars
const USE_DATABASE_URL = !!process.env.DATABASE_URL;

if (!USE_DATABASE_URL) {
  const REQUIRED = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = REQUIRED.filter(v => !process.env[v]);
  if (missing.length > 0) {
    logger.error(`Missing required DB env vars: ${missing.join(', ')}. Check backend/.env`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════
// 2. ENVIRONMENT SAFETY — prevent wrong DB usage
// ═══════════════════════════════════════════════════

const dbName = process.env.DB_NAME || '';
if (ENV === 'production' && dbName.includes('dev')) {
  logger.error('SAFETY: Production env is pointing to a DEV database! Aborting.');
  process.exit(1);
}
if (ENV === 'development' && dbName.includes('prod')) {
  logger.error('SAFETY: Development env is pointing to a PROD database! Aborting.');
  process.exit(1);
}

// ═══════════════════════════════════════════════════
// 3. POOL CONFIGURATION — production-grade settings
// ═══════════════════════════════════════════════════

const poolConfig = USE_DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
  : {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

// Shared pool settings (tune for thousands of concurrent users)
Object.assign(poolConfig, {
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: 30000,         // Close idle clients after 30s
  connectionTimeoutMillis: 5000,    // Fail fast if DB unreachable (5s)
  statement_timeout: 30000,         // Kill queries running > 30s
  query_timeout: 30000,
  keepAlive: true,                  // Prevent connection drops on cloud DBs
  keepAliveInitialDelayMillis: 10000,
});

const pool = new Pool(poolConfig);

// ═══════════════════════════════════════════════════
// 4. CONNECTION EVENTS — log everything
// ═══════════════════════════════════════════════════

let totalConnections = 0;
let activeConnections = 0;

pool.on('connect', (client) => {
  totalConnections++;
  activeConnections++;
  logger.info('New connection established', {
    action: 'POOL_CONNECT',
    host: process.env.DB_HOST || 'DATABASE_URL',
    db: process.env.DB_NAME || 'from_url',
    totalConnections,
    activeConnections,
  });
});

pool.on('acquire', () => {
  // Client checked out from pool — no log needed unless debugging
});

pool.on('remove', () => {
  activeConnections = Math.max(0, activeConnections - 1);
});

pool.on('error', (err) => {
  logger.error('Unexpected pool error on idle client', {
    action: 'POOL_ERROR',
    errorMessage: err.message,
    errorCode: err.code,
  });
  // Do NOT process.exit — let the pool auto-recover
});

// ═══════════════════════════════════════════════════
// 5. QUERY WRAPPER — with slow query tracking & retries
// ═══════════════════════════════════════════════════

const RETRYABLE_ERRORS = ['57P01', '08006', '08003', '08001', 'ECONNRESET', 'ECONNREFUSED'];
const MAX_RETRIES = 2;
const SLOW_QUERY_MS = 1000;

const originalQuery = pool.query.bind(pool);

pool.query = async function trackedQuery(text, params) {
  const start = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await originalQuery(text, params);
      const duration = Date.now() - start;

      // Track slow queries
      if (duration > SLOW_QUERY_MS) {
        logger.warn('Slow query detected', {
          action: 'SLOW_QUERY',
          query: typeof text === 'string' ? text.substring(0, 200) : 'prepared',
          duration_ms: duration,
          rows: result.rowCount,
          attempt: attempt + 1,
        });
      }

      return result;
    } catch (err) {
      lastError = err;
      const isRetryable = RETRYABLE_ERRORS.includes(err.code);

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        logger.warn(`Retryable DB error, attempt ${attempt + 1}/${MAX_RETRIES + 1}`, {
          action: 'QUERY_RETRY',
          errorCode: err.code,
          errorMessage: err.message,
          delay_ms: delay,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Log non-retryable or exhausted retries
      logger.error('Query failed', {
        action: 'QUERY_ERROR',
        query: typeof text === 'string' ? text.substring(0, 200) : 'prepared',
        errorMessage: err.message,
        errorCode: err.code,
        duration_ms: Date.now() - start,
        attempts: attempt + 1,
      });
      throw err;
    }
  }
  throw lastError;
};

// ═══════════════════════════════════════════════════
// 6. STARTUP CONNECTION TEST
// ═══════════════════════════════════════════════════

async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query(`
            SELECT 
                NOW() AS server_time, 
                current_database() AS db_name,
                version() AS pg_version,
                pg_size_pretty(pg_database_size(current_database())) AS db_size
        `);
    const { server_time, db_name, pg_version, db_size } = res.rows[0];
    logger.info('Database connection verified', {
      action: 'STARTUP_CHECK',
      database: db_name,
      serverTime: server_time,
      pgVersion: pg_version.split(' ').slice(0, 2).join(' '),
      dbSize: db_size,
      environment: ENV,
    });
    client.release();
    return true;
  } catch (err) {
    logger.error('Database startup test FAILED', {
      action: 'STARTUP_CHECK_FAILED',
      errorMessage: err.message,
      errorCode: err.code,
      advice: err.code === '28P01' ? 'Check DB_PASSWORD in .env'
        : err.code === '3D000' ? `Database "${process.env.DB_NAME}" does not exist`
          : err.code === 'ECONNREFUSED' ? 'PostgreSQL is not running'
            : 'Check your database configuration',
    });
    return false;
  }
}

// ═══════════════════════════════════════════════════
// 7. SCHEMA VERIFICATION — ensure tables exist
// ═══════════════════════════════════════════════════

const REQUIRED_TABLES = [
  'users', 'farmers', 'buyers', 'categories', 'products',
  'product_images', 'bids', 'orders', 'reviews', 'notifications',
  'platform_analytics', 'site_settings'
];

async function verifySchema() {
  try {
    const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
    const existingTables = result.rows.map(r => r.table_name);
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      logger.error('Schema verification FAILED — missing tables', {
        action: 'SCHEMA_CHECK_FAILED',
        missingTables,
        existingTables,
        advice: 'Run: psql -U postgres -d farmer_connect -f database/schema.sql',
      });
      return false;
    }

    // Check critical columns exist
    const userColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
        `);
    const colNames = userColumns.rows.map(r => r.column_name);
    const requiredUserCols = ['id', 'email', 'password_hash', 'user_type', 'name'];
    const missingCols = requiredUserCols.filter(c => !colNames.includes(c));

    if (missingCols.length > 0) {
      logger.error('Schema verification FAILED — users table missing columns', {
        action: 'SCHEMA_CHECK_FAILED',
        missingColumns: missingCols,
      });
      return false;
    }

    // Check migration tracking table exists
    const migrationTable = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'schema_migrations'
            ) AS exists
        `);

    logger.info('Schema verification passed', {
      action: 'SCHEMA_CHECK_OK',
      tables: existingTables.length,
      hasMigrationTable: migrationTable.rows[0].exists,
    });
    return true;
  } catch (err) {
    logger.error('Schema verification error', {
      action: 'SCHEMA_CHECK_ERROR',
      errorMessage: err.message,
    });
    return false;
  }
}

// ═══════════════════════════════════════════════════
// 8. GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Closing DB pool gracefully...`, { action: 'SHUTDOWN' });
  try {
    await pool.end();
    logger.info('DB pool closed successfully', { action: 'SHUTDOWN_COMPLETE' });
  } catch (err) {
    logger.error('Error closing DB pool', { action: 'SHUTDOWN_ERROR', errorMessage: err.message });
  }
}

// ═══════════════════════════════════════════════════
// 9. POOL STATS — for health check endpoint
// ═══════════════════════════════════════════════════

function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    activeConnections,
    totalConnectionsMade: totalConnections,
  };
}

module.exports = pool;
module.exports.testConnection = testConnection;
module.exports.verifySchema = verifySchema;
module.exports.gracefulShutdown = gracefulShutdown;
module.exports.getPoolStats = getPoolStats;
