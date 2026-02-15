const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notification_id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
