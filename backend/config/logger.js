const winston = require('winston');
const path = require('path');

// ─── Log format: structured JSON with timestamp ───
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// ─── Console format: human-readable for development ───
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, module, action, ...meta }) => {
        const mod = module ? `[${module}]` : '';
        const act = action ? `(${action})` : '';
        const extra = Object.keys(meta).length > 0
            ? '\n  ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n  ')
            : '';
        return `${timestamp} ${level} ${mod}${act} ${message}${extra}`;
    })
);

// ─── Log directory ───
const LOG_DIR = path.join(__dirname, '..', 'logs');

// ─── Create logger instance ───
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'farmer-connect' },
    transports: [
        // Console — always active
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
        }),

        // File — combined log (all levels)
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
            format: logFormat,
            maxsize: 10 * 1024 * 1024,  // 10MB per file
            maxFiles: 5,                 // Keep 5 rotated files
            tailable: true,
        }),

        // File — errors only
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
            tailable: true,
        }),

        // File — slow queries
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'slow-queries.log'),
            level: 'warn',
            format: logFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 3,
        }),
    ],
});

// ─── Convenience: create child loggers per module ───
logger.child = (moduleName) => {
    return {
        info: (message, meta = {}) => logger.info(message, { module: moduleName, ...meta }),
        warn: (message, meta = {}) => logger.warn(message, { module: moduleName, ...meta }),
        error: (message, meta = {}) => logger.error(message, { module: moduleName, ...meta }),
        debug: (message, meta = {}) => logger.debug(message, { module: moduleName, ...meta }),
    };
};

// ─── Query timer helper for tracking slow queries ───
logger.queryTimer = (queryText) => {
    const start = Date.now();
    const SLOW_QUERY_THRESHOLD_MS = 1000; // 1 second

    return {
        end: (rowCount = 0) => {
            const duration = Date.now() - start;
            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                logger.warn('Slow query detected', {
                    module: 'DB',
                    action: 'SLOW_QUERY',
                    query: queryText.substring(0, 200), // Truncate for safety
                    duration_ms: duration,
                    rows: rowCount,
                });
            }
            return duration;
        }
    };
};

module.exports = logger;
