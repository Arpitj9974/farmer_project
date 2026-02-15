const rateLimit = require('express-rate-limit');

// General API rate limiter: 1000 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Login rate limiter: 10 attempts per 1 minute (brute-force protection)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Please try again after 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by IP + email combination for smarter protection
        return `${req.ip}_${req.body?.email || 'unknown'}`;
    },
    handler: (req, res) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            module: 'SECURITY',
            action: 'RATE_LIMIT_HIT',
            ip: req.ip,
            email: req.body?.email,
            route: req.originalUrl,
        }));
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please wait 1 minute before trying again.'
        });
    }
});

// Registration rate limiter: 5 per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many registration attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Bidding rate limiter: 100 bids per minute per user
const bidLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many bid attempts. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, loginLimiter, registerLimiter, bidLimiter };
