const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation } = require('../middleware/validator');
const { uploadAvatar } = require('../config/multer');

// Public routes
router.post('/register', registerLimiter, registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);
router.put('/profile/avatar', auth, uploadAvatar.single('avatar'), authController.uploadAvatar);

module.exports = router;
