const logger = require('../config/logger').child('ERROR');

const errorHandler = (err, req, res, next) => {
    // Structured error logging
    logger.error(err.message || 'Unknown error', {
        action: 'UNHANDLED_ROUTE_ERROR',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        errorCode: err.code,
        statusCode: err.statusCode || 500,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: 'Too many files. Maximum is 3 images.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Unexpected file field.' });
    }

    // Validation errors from express-validator
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({ success: false, errors: err.array() });
    }

    // PostgreSQL errors → clean user-facing messages
    if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Duplicate entry. This record already exists.' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ success: false, message: 'Referenced record not found.' });
    }
    if (err.code === '23502') {
        return res.status(400).json({ success: false, message: 'Required field is missing.' });
    }
    if (err.code === '22P02') {
        return res.status(400).json({ success: false, message: 'Invalid input format.' });
    }
    if (err.code === '57P03' || err.code === '57P01') {
        return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please try again.' });
    }
    if (err.code === 'ECONNREFUSED' || err.code === '08006' || err.code === '08003') {
        return res.status(503).json({ success: false, message: 'Service temporarily unavailable. Please try again.' });
    }

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'Origin not allowed.' });
    }

    // Default error — never expose internals in production
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { debug: err.message, stack: err.stack }),
    });
};

module.exports = errorHandler;
