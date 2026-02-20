const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// AI Chat — requires authentication + strict rate limiting
// This protects the Gemini API key quota from abuse
router.post('/chat', auth, aiLimiter, aiController.chat);

module.exports = router;
