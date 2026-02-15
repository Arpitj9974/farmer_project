const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const auth = require('../middleware/auth');
const { farmerOnly, buyerOnly } = require('../middleware/roleCheck');
const { bidLimiter } = require('../middleware/rateLimiter');
const { bidValidation, paginationValidation } = require('../middleware/validator');

// Public
router.get('/history/:product_id', bidController.getBidHistory);

// Buyer routes
router.post('/', auth, buyerOnly, bidLimiter, bidValidation, bidController.placeBid);
router.get('/my-bids', auth, buyerOnly, paginationValidation, bidController.getMyBids);

// Farmer routes
router.get('/product/:product_id', auth, farmerOnly, bidController.getProductBids);
router.post('/:bid_id/accept', auth, farmerOnly, bidController.acceptBid);
router.post('/product/:product_id/close', auth, farmerOnly, bidController.closeBidding);

module.exports = router;
