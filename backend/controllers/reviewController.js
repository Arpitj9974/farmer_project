const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { paginate, paginationResponse } = require('../utils/helpers');

// Submit review
exports.submitReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { order_id, rating, review_text } = req.body;

        // Get buyer id
        const buyerResult = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        if (buyerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Buyer profile not found' });
        }
        const buyerId = buyerResult.rows[0].id;

        // Verify order exists, belongs to buyer, and is delivered
        const order = await pool.query(
            `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 AND order_status = 'delivered'`,
            [order_id, buyerId]
        );
        if (order.rows.length === 0) {
            return res.status(400).json({ message: 'Cannot review this order. Order must be delivered.' });
        }

        // Check if already reviewed
        const existingReview = await pool.query('SELECT id FROM reviews WHERE order_id = $1', [order_id]);
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }

        // Create review
        const farmerId = order.rows[0].farmer_id;
        await pool.query(
            `INSERT INTO reviews (order_id, buyer_id, farmer_id, rating, review_text) VALUES ($1, $2, $3, $4, $5)`,
            [order_id, buyerId, farmerId, rating, review_text]
        );

        // Update farmer's overall rating
        const avgRating = await pool.query(
            `SELECT AVG(rating) as avg_rating FROM reviews WHERE farmer_id = $1`,
            [farmerId]
        );
        await pool.query(
            `UPDATE farmers SET overall_rating = $1 WHERE id = $2`,
            [parseFloat(avgRating.rows[0].avg_rating).toFixed(2), farmerId]
        );

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

// Get farmer reviews
exports.getFarmerReviews = async (req, res) => {
    try {
        const { farmer_id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Get farmer rating summary
        const summary = await pool.query(
            `SELECT f.overall_rating, COUNT(r.id) as total_reviews,
              SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
              SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
              SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
              SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
              SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM farmers f LEFT JOIN reviews r ON f.id = r.farmer_id
       WHERE f.id = $1 GROUP BY f.id, f.overall_rating`,
            [farmer_id]
        );

        // Get reviews
        const countResult = await pool.query('SELECT COUNT(*) FROM reviews WHERE farmer_id = $1', [farmer_id]);
        const total = parseInt(countResult.rows[0].count);

        const { limit: lim, offset } = paginate(page, limit);
        const reviews = await pool.query(
            `SELECT r.*, u.name as buyer_name, p.name as product_name
       FROM reviews r
       JOIN buyers b ON r.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN orders o ON r.order_id = o.id
       JOIN products p ON o.product_id = p.id
       WHERE r.farmer_id = $1
       ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
            [farmer_id, lim, offset]
        );

        res.json({
            summary: summary.rows[0] || { overall_rating: 0, total_reviews: 0 },
            ...paginationResponse(reviews.rows, total, page, lim)
        });
    } catch (error) {
        console.error('Get farmer reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// Check if buyer can review an order
exports.canReview = async (req, res) => {
    try {
        const { order_id } = req.params;
        const buyerResult = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        const buyerId = buyerResult.rows[0]?.id;

        const order = await pool.query(
            `SELECT o.id, o.order_status, (SELECT id FROM reviews WHERE order_id = o.id) as review_id
       FROM orders o WHERE o.id = $1 AND o.buyer_id = $2`,
            [order_id, buyerId]
        );

        if (order.rows.length === 0) {
            return res.json({ can_review: false, reason: 'Order not found' });
        }
        if (order.rows[0].order_status !== 'delivered') {
            return res.json({ can_review: false, reason: 'Order not yet delivered' });
        }
        if (order.rows[0].review_id) {
            return res.json({ can_review: false, reason: 'Already reviewed' });
        }

        res.json({ can_review: true });
    } catch (error) {
        console.error('Can review error:', error);
        res.status(500).json({ message: 'Failed to check review status' });
    }
};

// Get buyer's reviews
exports.getMyReviews = async (req, res) => {
    try {
        const buyerResult = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        const buyerId = buyerResult.rows[0]?.id;

        const result = await pool.query(
            `SELECT r.*, p.name as product_name, u.name as farmer_name
       FROM reviews r
       JOIN orders o ON r.order_id = o.id
       JOIN products p ON o.product_id = p.id
       JOIN farmers f ON r.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE r.buyer_id = $1 ORDER BY r.created_at DESC`,
            [buyerId]
        );

        res.json({ reviews: result.rows });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};
