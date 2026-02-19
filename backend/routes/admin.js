const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { paginationValidation } = require('../middleware/validator');

router.use(auth, adminOnly);

router.get('/dashboard', adminController.getDashboard);
router.get('/pending-verifications', paginationValidation, adminController.getPendingVerifications);
router.put('/verify/:user_id', adminController.verifyUser);
router.get('/pending-products', paginationValidation, adminController.getPendingProducts);
router.put('/products/:product_id', adminController.manageProduct);
router.get('/users', paginationValidation, adminController.getUsers);

// ─── Image Fix Routes ───────────────────────────
const { fixAllProductImages, validateAndAssignImage } = require('../services/imageService');

// Fix ALL product images
router.post('/fix-images', async (req, res) => {
    try {
        const useGemini = req.body.useGemini === true;
        const result = await fixAllProductImages({ useGemini, dryRun: false });
        res.json({ message: 'Image fix complete', ...result });
    } catch (err) {
        console.error('Fix images error:', err);
        res.status(500).json({ message: 'Failed to fix images', error: err.message });
    }
});

// Fix a single product's image
router.post('/fix-images/:product_id', async (req, res) => {
    try {
        const result = await validateAndAssignImage(req.params.product_id);
        res.json({ message: 'Image fixed', ...result });
    } catch (err) {
        console.error('Fix single image error:', err);
        res.status(500).json({ message: 'Failed to fix image', error: err.message });
    }
});

module.exports = router;
