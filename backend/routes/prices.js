const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const protect = require('../middleware/auth');

// Public routes (or protected if preferred, but usually prices are public)
router.get('/msp', priceController.getMSPPrices);
router.get('/apmc', priceController.getAPMCPrices);

// Protected route for AI Search (to prevent abuse)
router.post('/search', priceController.searchPriceAI);

module.exports = router;
