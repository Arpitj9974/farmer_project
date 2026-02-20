const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const protect = require('../middleware/auth');
const { aiLimiter, marketDataLimiter } = require('../middleware/rateLimiter');

// Public routes — rate-limited to prevent abuse
router.get('/msp', priceController.getMSPPrices);
router.get('/apmc', marketDataLimiter, priceController.getAPMCPrices);

// Protected + AI rate-limited (calls Gemini — quota-sensitive!)
router.post('/search', protect, aiLimiter, priceController.searchPriceAI);

module.exports = router;
