const rateLimit = require('express-rate-limit');

// ═══════════════════════════════════════════════════════════════
// GENERAL API LIMITER — applies to all /api/* routes
// 500 requests per 15 minutes per IP
// ═══════════════════════════════════════════════════════════════
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════════
// LOGIN LIMITER — brute-force protection
// 10 attempts per minute per IP+email
// ═══════════════════════════════════════════════════════════════
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Please try again after 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return `${req.ip}_${req.body?.email || 'unknown'}`;
    },
    handler: (req, res) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            module: 'SECURITY',
            action: 'LOGIN_RATE_LIMIT_HIT',
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

// ═══════════════════════════════════════════════════════════════
// REGISTRATION LIMITER — prevent mass account creation
// 5 accounts per hour per IP
// ═══════════════════════════════════════════════════════════════
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many registration attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════════
// BIDDING LIMITER — prevent bid flooding
// 30 bids per minute per IP
// ═══════════════════════════════════════════════════════════════
const bidLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many bid attempts. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════════
// AI LIMITER — CRITICAL: Protects Gemini API quota
// 20 requests per hour per IP (Gemini costs money!)
// ═══════════════════════════════════════════════════════════════
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,     // 1 hour window
    max: 20,                       // 20 requests per hour
    message: {
        success: false,
        message: 'AI request limit reached (20/hour). Please try again later to save API quota.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            module: 'SECURITY',
            action: 'AI_RATE_LIMIT_HIT',
            ip: req.ip,
            user: req.user?.id || 'unknown',
            route: req.originalUrl,
        }));
        res.status(429).json({
            success: false,
            message: 'AI request limit reached (20/hour). Please try again later.'
        });
    }
});

// ═══════════════════════════════════════════════════════════════
// MARKET DATA LIMITER — Protects Data.gov.in API quota
// 60 requests per 15 minutes per IP
// ═══════════════════════════════════════════════════════════════
const marketDataLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,     // 15 minute window
    max: 60,                       // 60 requests per 15 min
    message: {
        success: false,
        message: 'Market data request limit reached. Please try again in a few minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            module: 'SECURITY',
            action: 'MARKET_DATA_RATE_LIMIT_HIT',
            ip: req.ip,
            route: req.originalUrl,
        }));
        res.status(429).json({
            success: false,
            message: 'Too many market data requests. Please wait a few minutes.'
        });
    }
});

module.exports = {
    generalLimiter,
    loginLimiter,
    registerLimiter,
    bidLimiter,
    aiLimiter,
    marketDataLimiter
};
