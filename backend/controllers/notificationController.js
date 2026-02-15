const pool = require('../config/database');

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const { is_read } = req.query;
        let query = `SELECT * FROM notifications WHERE user_id = $1`;
        const params = [req.user.id];

        if (is_read !== undefined) {
            query += ` AND is_read = $2`;
            params.push(is_read === 'true');
        }

        query += ` ORDER BY created_at DESC LIMIT 50`;
        const result = await pool.query(query, params);

        res.json({ notifications: result.rows });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
            [req.user.id]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params;
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
            [notification_id, req.user.id]
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.user.id]);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Failed to mark all as read' });
    }
};
