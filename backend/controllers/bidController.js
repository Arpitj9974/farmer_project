const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { getFailedAuctionInsights, generateOrderNumber } = require('../utils/priceGuidance');
const { calculateCommission, paginate, paginationResponse } = require('../utils/helpers');

// Place bid (CONCURRENCY SAFE with FOR UPDATE)
exports.placeBid = async (req, res) => {
    const client = await pool.connect();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { product_id, amount } = req.body;

        // Get buyer id
        const buyerResult = await client.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        if (buyerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Buyer profile not found' });
        }
        const buyerId = buyerResult.rows[0].id;

        await client.query('BEGIN');

        // CRITICAL: Lock the product row to prevent race conditions
        const productResult = await client.query(
            'SELECT * FROM products WHERE id = $1 FOR UPDATE',
            [product_id]
        );

        if (productResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productResult.rows[0];

        // Validate product status and mode
        if (product.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Product is not available for bidding' });
        }
        if (product.selling_mode !== 'bidding') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'This product is not in bidding mode' });
        }

        // Validate bid amount
        if (parseFloat(amount) <= parseFloat(product.base_price)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Bid must be higher than base price ₹${product.base_price}/kg` });
        }
        if (parseFloat(amount) <= parseFloat(product.current_highest_bid || 0)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Bid must be higher than current highest bid ₹${product.current_highest_bid}/kg` });
        }

        // Check if buyer already has an active bid on this product
        const existingBid = await client.query(
            "SELECT id FROM bids WHERE product_id = $1 AND buyer_id = $2 AND status = 'active' FOR UPDATE",
            [product_id, buyerId]
        );

        let bidId;
        if (existingBid.rows.length > 0) {
            // Update existing bid
            const updateResult = await client.query(
                'UPDATE bids SET amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
                [amount, existingBid.rows[0].id]
            );
            bidId = updateResult.rows[0].id;
        } else {
            // Insert new bid
            const insertResult = await client.query(
                'INSERT INTO bids (product_id, buyer_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
                [product_id, buyerId, amount, 'active']
            );
            bidId = insertResult.rows[0].id;
        }

        // Mark all other active bids as outbid
        await client.query(
            "UPDATE bids SET status = 'outbid', updated_at = CURRENT_TIMESTAMP WHERE product_id = $1 AND buyer_id != $2 AND status = 'active'",
            [product_id, buyerId]
        );

        // Update product's current_highest_bid
        await client.query(
            'UPDATE products SET current_highest_bid = $1 WHERE id = $2',
            [amount, product_id]
        );

        await client.query('COMMIT');

        // Create notification for farmer (outside transaction)
        const farmerUser = await pool.query(
            'SELECT u.id FROM users u JOIN farmers f ON u.id = f.user_id WHERE f.id = $1',
            [product.farmer_id]
        );
        if (farmerUser.rows.length > 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'bid_received', 'New Bid Received', $2, $3)`,
                [farmerUser.rows[0].id, `New bid of ₹${amount}/kg on ${product.name}`, `/farmer/products/${product_id}/bids`]
            );
        }

        res.status(201).json({ message: 'Bid placed successfully', bidId, amount });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Place bid error:', error);
        res.status(500).json({ message: 'Failed to place bid' });
    } finally {
        client.release();
    }
};

// Accept bid (farmer) - Creates order automatically
exports.acceptBid = async (req, res) => {
    const client = await pool.connect();
    try {
        const { bid_id } = req.params;

        // Get farmer id
        const farmerResult = await client.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        await client.query('BEGIN');

        // Lock bid and product
        const bidResult = await client.query(
            `SELECT b.*, p.farmer_id, p.name as product_name, p.quantity_kg, p.status as product_status
       FROM bids b JOIN products p ON b.product_id = p.id
       WHERE b.id = $1 FOR UPDATE`,
            [bid_id]
        );

        if (bidResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Bid not found' });
        }

        const bid = bidResult.rows[0];

        // Verify ownership
        if (bid.farmer_id !== farmerId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You can only accept bids on your own products' });
        }

        // Verify bid status
        if (bid.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'This bid is no longer active' });
        }

        if (bid.product_status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Product is no longer available' });
        }

        // Mark this bid as won
        await client.query("UPDATE bids SET status = 'won', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [bid_id]);

        // Mark all other bids as rejected
        await client.query(
            "UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE product_id = $1 AND id != $2",
            [bid.product_id, bid_id]
        );

        // Update product status
        await client.query("UPDATE products SET status = 'bidding_closed' WHERE id = $1", [bid.product_id]);

        // Calculate amounts
        const totalAmount = parseFloat(bid.quantity_kg) * parseFloat(bid.amount);
        const commissionAmount = calculateCommission(totalAmount);
        const orderNumber = generateOrderNumber();

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (order_number, product_id, farmer_id, buyer_id, quantity_kg, price_per_kg, total_amount, commission_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, order_number`,
            [orderNumber, bid.product_id, farmerId, bid.buyer_id, bid.quantity_kg, bid.amount, totalAmount, commissionAmount]
        );

        // Increment farmer's total orders
        await client.query('UPDATE farmers SET total_orders = total_orders + 1 WHERE id = $1', [farmerId]);

        await client.query('COMMIT');

        // Notify winning buyer
        const buyerUser = await pool.query('SELECT user_id FROM buyers WHERE id = $1', [bid.buyer_id]);
        if (buyerUser.rows.length > 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'bid_won', 'Congratulations! Your Bid Won', $2, $3)`,
                [buyerUser.rows[0].user_id, `Your bid of ₹${bid.amount}/kg on ${bid.product_name} was accepted!`, `/buyer/orders/${orderResult.rows[0].id}`]
            );
        }

        res.json({
            message: 'Bid accepted. Order created successfully.',
            order: orderResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Accept bid error:', error);
        res.status(500).json({ message: 'Failed to accept bid' });
    } finally {
        client.release();
    }
};

// Close bidding without accepting (farmer)
exports.closeBidding = async (req, res) => {
    const client = await pool.connect();
    try {
        const { product_id } = req.params;

        const farmerResult = await client.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        const farmerId = farmerResult.rows[0].id;

        await client.query('BEGIN');

        const product = await client.query(
            'SELECT * FROM products WHERE id = $1 AND farmer_id = $2 FOR UPDATE',
            [product_id, farmerId]
        );

        if (product.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.rows[0].selling_mode !== 'bidding' || product.rows[0].status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Cannot close bidding for this product' });
        }

        // Get failure insights before rejecting bids
        const insights = await getFailedAuctionInsights(product_id);

        // Reject all bids
        await client.query(
            "UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE product_id = $1",
            [product_id]
        );

        // Update product with failure info
        await client.query(
            `UPDATE products SET status = 'bidding_closed', failure_reason = $1, failure_suggestions = $2 WHERE id = $3`,
            [insights.reason, insights.suggestions, product_id]
        );

        await client.query('COMMIT');

        res.json({ message: 'Bidding closed', insights });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Close bidding error:', error);
        res.status(500).json({ message: 'Failed to close bidding' });
    } finally {
        client.release();
    }
};

// Get bids for a product (farmer)
exports.getProductBids = async (req, res) => {
    try {
        const { product_id } = req.params;

        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        const farmerId = farmerResult.rows[0].id;

        // Verify ownership
        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [product_id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const result = await pool.query(
            `SELECT b.*, u.name as buyer_name, bu.business_name, bu.business_type
       FROM bids b JOIN buyers bu ON b.buyer_id = bu.id JOIN users u ON bu.user_id = u.id
       WHERE b.product_id = $1 ORDER BY b.amount DESC`,
            [product_id]
        );

        res.json({ bids: result.rows, product: product.rows[0] });
    } catch (error) {
        console.error('Get product bids error:', error);
        res.status(500).json({ message: 'Failed to fetch bids' });
    }
};

// Get buyer's bids
exports.getMyBids = async (req, res) => {
    try {
        const buyerResult = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        if (buyerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Buyer profile not found' });
        }
        const buyerId = buyerResult.rows[0].id;

        const { status, page = 1, limit = 10 } = req.query;
        let query = `SELECT b.*, p.name as product_name, p.current_highest_bid, p.status as product_status,
                 c.name as category_name, u.name as farmer_name, f.city,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image
                 FROM bids b JOIN products p ON b.product_id = p.id
                 JOIN categories c ON p.category_id = c.id
                 JOIN farmers f ON p.farmer_id = f.id JOIN users u ON f.user_id = u.id
                 WHERE b.buyer_id = $1`;
        const params = [buyerId];
        let paramIndex = 2;

        if (status) { query += ` AND b.status = $${paramIndex++}`; params.push(status); }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) c`, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY b.created_at DESC`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({ message: 'Failed to fetch bids' });
    }
};

// Get bid history (public, anonymized)
exports.getBidHistory = async (req, res) => {
    try {
        const { product_id } = req.params;
        const result = await pool.query(
            `SELECT amount, status, created_at FROM bids WHERE product_id = $1 ORDER BY amount DESC`,
            [product_id]
        );
        res.json({ bids: result.rows });
    } catch (error) {
        console.error('Get bid history error:', error);
        res.status(500).json({ message: 'Failed to fetch bid history' });
    }
};
