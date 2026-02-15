const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const { buyerOnly } = require('../middleware/roleCheck');
const { reviewValidation } = require('../middleware/validator');

// Public
router.get('/farmer/:farmer_id', reviewController.getFarmerReviews);

// Buyer routes
router.post('/', auth, buyerOnly, reviewValidation, reviewController.submitReview);
router.get('/my-reviews', auth, buyerOnly, reviewController.getMyReviews);
router.get('/can-review/:order_id', auth, buyerOnly, reviewController.canReview);

module.exports = router;
