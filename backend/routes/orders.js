const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { farmerOnly, buyerOnly, farmerOrBuyer } = require('../middleware/roleCheck');
const { orderValidation, paginationValidation } = require('../middleware/validator');

// Buyer routes
router.post('/', auth, buyerOnly, orderValidation, orderController.createOrder);
router.post('/:id/payment', auth, buyerOnly, orderController.processPayment);

// Farmer routes
router.put('/:id/status', auth, farmerOnly, orderController.updateOrderStatus);

// Shared routes
router.get('/my-orders', auth, farmerOrBuyer, paginationValidation, orderController.getMyOrders);
router.get('/:id', auth, farmerOrBuyer, orderController.getOrder);
router.get('/:id/invoice', auth, farmerOrBuyer, orderController.getInvoice);

module.exports = router;
