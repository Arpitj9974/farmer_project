const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { farmerOnly } = require('../middleware/roleCheck');
const { productValidation, paginationValidation } = require('../middleware/validator');
const { uploadProductImages } = require('../config/multer');

// ═══════════════════════════════════════════════════
// SPECIFIC ROUTES (Must precede /:id)
// ═══════════════════════════════════════════════════
router.get('/categories', productController.getCategories);
router.get('/price-guidance/:category_id', productController.getPriceGuidance);

// ═══════════════════════════════════════════════════
// FARMER SPECIFIC ROUTES (Must precede /:id)
// ═══════════════════════════════════════════════════
router.get('/farmer/my-products', auth, farmerOnly, paginationValidation, productController.getMyProducts);
router.get('/farmer/analytics', auth, farmerOnly, productController.getFarmerAnalytics);
router.get('/farmer/watchlist', auth, farmerOnly, productController.getWatchlist);
router.post('/farmer/watchlist', auth, farmerOnly, productController.updateWatchlist);

// ═══════════════════════════════════════════════════
// GENERAL PRODUCT ROUTES
// ═══════════════════════════════════════════════════
router.get('/', paginationValidation, productController.getProducts);
router.post('/', auth, farmerOnly, uploadProductImages.array('images', 3), productValidation, productController.createProduct);

// ═══════════════════════════════════════════════════
// ID SPECIFIC ROUTES
// ═══════════════════════════════════════════════════
router.get('/:id', productController.getProduct);
router.put('/:id', auth, farmerOnly, productController.updateProduct);
router.delete('/:id', auth, farmerOnly, productController.deleteProduct);
router.put('/:id/image', auth, farmerOnly, uploadProductImages.single('image'), productController.updateProductImage);

module.exports = router;
