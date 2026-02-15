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

module.exports = router;
