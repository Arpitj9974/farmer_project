const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for AI chat: 20 requests per hour per user
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50, // Increased for better UX during testing
    message: { success: false, message: 'Too many AI requests. Please try again after an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/chat', auth, aiLimiter, aiController.chat);

module.exports = router;
