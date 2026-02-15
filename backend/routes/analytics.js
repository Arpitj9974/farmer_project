const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

router.use(auth, adminOnly);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/daily', analyticsController.getDaily);
router.get('/export', analyticsController.exportCSV);

module.exports = router;
