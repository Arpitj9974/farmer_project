const pool = require('../config/database');
const { paginate, paginationResponse } = require('../utils/helpers');

// Admin dashboard stats
exports.getDashboard = async (req, res) => {
    try {
        const stats = {};

        // User counts
        const users = await pool.query(`SELECT user_type, COUNT(*) FROM users GROUP BY user_type`);
        users.rows.forEach(r => stats[`total_${r.user_type}s`] = parseInt(r.count));
        stats.total_users = Object.values(stats).reduce((a, b) => a + b, 0);

        // Pending verifications
        const pending = await pool.query(`SELECT COUNT(*) FROM users WHERE verification_status = 'pending' AND user_type != 'admin'`);
        stats.pending_verifications = parseInt(pending.rows[0].count);

        // Products
        const products = await pool.query(`SELECT status, COUNT(*) FROM products GROUP BY status`);
        stats.products_by_status = {};
        products.rows.forEach(r => stats.products_by_status[r.status] = parseInt(r.count));
        stats.total_products = products.rows.reduce((a, r) => a + parseInt(r.count), 0);

        // Orders
        const orders = await pool.query(`SELECT order_status, COUNT(*), SUM(total_amount) as total, SUM(commission_amount) as commission FROM orders GROUP BY order_status`);
        stats.orders_by_status = {};
        let totalRevenue = 0, totalCommission = 0;
        orders.rows.forEach(r => {
            stats.orders_by_status[r.order_status] = parseInt(r.count);
            totalRevenue += parseFloat(r.total || 0);
            totalCommission += parseFloat(r.commission || 0);
        });
        stats.total_orders = orders.rows.reduce((a, r) => a + parseInt(r.count), 0);
        stats.total_revenue = totalRevenue;
        stats.total_commission = totalCommission;

        // Recent activity
        const recentOrders = await pool.query(
            `SELECT o.order_number, o.total_amount, o.order_status, o.created_at, p.name as product_name
       FROM orders o JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC LIMIT 10`
        );
        stats.recent_orders = recentOrders.rows;

        res.json({ stats });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
};

// Get pending verifications
exports.getPendingVerifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = `SELECT u.id, u.email, u.name, u.user_type, u.created_at,
                   f.farm_address, f.city, f.state, f.pincode, f.farm_size,
                   b.business_name, b.business_type, b.gst_number
                   FROM users u
                   LEFT JOIN farmers f ON u.id = f.user_id
                   LEFT JOIN buyers b ON u.id = b.user_id
                   WHERE u.verification_status = 'pending' AND u.user_type != 'admin'
                   ORDER BY u.created_at`;

        const countResult = await pool.query(`SELECT COUNT(*) FROM users WHERE verification_status = 'pending' AND user_type != 'admin'`);
        const total = parseInt(countResult.rows[0].count);

        const { limit: lim, offset } = paginate(page, limit);
        const result = await pool.query(`${query} LIMIT $1 OFFSET $2`, [lim, offset]);

        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({ message: 'Failed to fetch pending verifications' });
    }
};

// Verify user (approve/reject)
exports.verifyUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { action, notes } = req.body; // action: 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'approve') {
            await pool.query(
                `UPDATE users SET is_verified = true, verification_status = 'approved', admin_notes = $1 WHERE id = $2`,
                [notes, user_id]
            );
            if (user.rows[0].user_type === 'farmer') {
                await pool.query('UPDATE farmers SET verified_at = CURRENT_TIMESTAMP WHERE user_id = $1', [user_id]);
            }
        } else {
            await pool.query(
                `UPDATE users SET verification_status = 'rejected', admin_notes = $1 WHERE id = $2`,
                [notes || 'Verification rejected', user_id]
            );
        }

        // Notify user
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'verification_update', $2, $3)`,
            [user_id, action === 'approve' ? 'Account Verified!' : 'Verification Rejected',
                action === 'approve' ? 'Your account has been verified. You can now use all features.' : `Your verification was rejected. Reason: ${notes || 'Not specified'}`]
        );

        res.json({ message: `User ${action}d successfully` });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ message: 'Failed to verify user' });
    }
};

// Get pending products
exports.getPendingProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = `SELECT p.*, c.name as category_name, u.name as farmer_name, f.city,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
                   FROM products p
                   JOIN categories c ON p.category_id = c.id
                   JOIN farmers f ON p.farmer_id = f.id
                   JOIN users u ON f.user_id = u.id
                   WHERE p.status = 'pending_approval'
                   ORDER BY p.created_at`;

        const countResult = await pool.query(`SELECT COUNT(*) FROM products WHERE status = 'pending_approval'`);
        const total = parseInt(countResult.rows[0].count);

        const { limit: lim, offset } = paginate(page, limit);
        const result = await pool.query(`${query} LIMIT $1 OFFSET $2`, [lim, offset]);

        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get pending products error:', error);
        res.status(500).json({ message: 'Failed to fetch pending products' });
    }
};

// Approve/reject product
exports.manageProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const product = await pool.query(
            `SELECT p.*, f.user_id as farmer_user_id FROM products p JOIN farmers f ON p.farmer_id = f.id WHERE p.id = $1`,
            [product_id]
        );
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (action === 'approve') {
            await pool.query(`UPDATE products SET status = 'active' WHERE id = $1`, [product_id]);
        } else {
            await pool.query(`UPDATE products SET status = 'rejected', rejection_reason = $1 WHERE id = $2`, [reason, product_id]);
        }

        // Notify farmer
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)`,
            [product.rows[0].farmer_user_id,
            action === 'approve' ? 'product_approved' : 'product_rejected',
            action === 'approve' ? 'Product Approved!' : 'Product Rejected',
            action === 'approve' ? `Your product "${product.rows[0].name}" is now live!` : `Your product "${product.rows[0].name}" was rejected. Reason: ${reason}`,
            `/farmer/products/${product_id}`]
        );

        res.json({ message: `Product ${action}d successfully` });
    } catch (error) {
        console.error('Manage product error:', error);
        res.status(500).json({ message: 'Failed to manage product' });
    }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
    try {
        const { user_type, is_verified, page = 1, limit = 20 } = req.query;
        let query = `SELECT u.id, u.email, u.name, u.user_type, u.is_verified, u.verification_status, u.created_at, u.last_login
                 FROM users u WHERE u.user_type != 'admin'`;
        const params = [];
        let paramIndex = 1;

        if (user_type) { query += ` AND u.user_type = $${paramIndex++}`; params.push(user_type); }
        if (is_verified !== undefined) { query += ` AND u.is_verified = $${paramIndex++}`; params.push(is_verified === 'true'); }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) c`, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY u.created_at DESC`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
