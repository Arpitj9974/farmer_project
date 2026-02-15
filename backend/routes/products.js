const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { farmerOnly } = require('../middleware/roleCheck');
const { productValidation, paginationValidation } = require('../middleware/validator');
const { uploadProductImages } = require('../config/multer');

// Public routes
router.get('/', paginationValidation, productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/price-guidance/:category_id', productController.getPriceGuidance);
router.get('/:id', productController.getProduct);

// Farmer routes
router.post('/', auth, farmerOnly, uploadProductImages.array('images', 3), productValidation, productController.createProduct);
router.get('/farmer/my-products', auth, farmerOnly, paginationValidation, productController.getMyProducts);
router.put('/:id', auth, farmerOnly, productController.updateProduct);
router.delete('/:id', auth, farmerOnly, productController.deleteProduct);

// Watchlist routes
router.get('/farmer/watchlist', auth, farmerOnly, productController.getWatchlist);
router.post('/farmer/watchlist', auth, farmerOnly, productController.updateWatchlist);

module.exports = router;
