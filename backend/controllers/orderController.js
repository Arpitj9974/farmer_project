const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { generateOrderNumber, generateTransactionId } = require('../utils/priceGuidance');
const { calculateCommission, paginate, paginationResponse } = require('../utils/helpers');
const { generateInvoice } = require('../utils/pdfGenerator');
const path = require('path');

// Create order (fixed price products)
exports.createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { product_id, quantity_kg } = req.body;

        // Get buyer id
        const buyerResult = await client.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        if (buyerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Buyer profile not found' });
        }
        const buyerId = buyerResult.rows[0].id;

        await client.query('BEGIN');

        // Lock product row
        const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [product_id]);
        if (productResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productResult.rows[0];

        // Validations
        if (product.selling_mode !== 'fixed_price') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'This product is only available via bidding' });
        }
        if (product.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Product is not available' });
        }
        if (parseFloat(quantity_kg) < 50) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Minimum order quantity is 50kg' });
        }
        if (parseFloat(quantity_kg) > parseFloat(product.quantity_kg)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Only ${product.quantity_kg}kg available` });
        }

        // Calculate amounts
        const pricePerKg = parseFloat(product.fixed_price);
        const totalAmount = parseFloat(quantity_kg) * pricePerKg;
        const commissionAmount = calculateCommission(totalAmount);
        const orderNumber = generateOrderNumber();

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (order_number, product_id, farmer_id, buyer_id, quantity_kg, price_per_kg, total_amount, commission_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [orderNumber, product_id, product.farmer_id, buyerId, quantity_kg, pricePerKg, totalAmount, commissionAmount]
        );

        // Update product quantity
        const newQty = parseFloat(product.quantity_kg) - parseFloat(quantity_kg);
        const newStatus = newQty <= 0 ? 'sold' : 'active';
        await client.query('UPDATE products SET quantity_kg = $1, status = $2 WHERE id = $3', [Math.max(0, newQty), newStatus, product_id]);

        // Increment farmer's total orders
        await client.query('UPDATE farmers SET total_orders = total_orders + 1 WHERE id = $1', [product.farmer_id]);

        // Increment buyer's total purchases
        await client.query('UPDATE buyers SET total_purchases = total_purchases + 1 WHERE id = $1', [buyerId]);

        await client.query('COMMIT');

        // Notify farmer
        const farmerUser = await pool.query('SELECT u.id FROM users u JOIN farmers f ON u.id = f.user_id WHERE f.id = $1', [product.farmer_id]);
        if (farmerUser.rows.length > 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, 'order_update', 'New Order Received', $2, $3)`,
                [farmerUser.rows[0].id, `New order of ${quantity_kg}kg for ${product.name}`, `/farmer/orders/${orderResult.rows[0].id}`]
            );
        }

        res.status(201).json({ message: 'Order placed successfully', order: orderResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Failed to create order' });
    } finally {
        client.release();
    }
};

// Get orders (based on user type)
exports.getMyOrders = async (req, res) => {
    try {
        const { order_status, payment_status, page = 1, limit = 10 } = req.query;
        let roleId, roleColumn;

        if (req.user.user_type === 'farmer') {
            const f = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
            roleId = f.rows[0]?.id;
            roleColumn = 'farmer_id';
        } else {
            const b = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
            roleId = b.rows[0]?.id;
            roleColumn = 'buyer_id';
        }

        if (!roleId) return res.status(403).json({ message: 'Profile not found' });

        let query = `SELECT o.*, p.name as product_name, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
                 fu.name as farmer_name, bu.name as buyer_name, f.city as farmer_city
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN categories c ON p.category_id = c.id
                 JOIN farmers f ON o.farmer_id = f.id
                 JOIN users fu ON f.user_id = fu.id
                 JOIN buyers b ON o.buyer_id = b.id
                 JOIN users bu ON b.user_id = bu.id
                 WHERE o.${roleColumn} = $1`;

        const params = [roleId];
        let paramIndex = 2;

        if (order_status) { query += ` AND o.order_status = $${paramIndex++}`; params.push(order_status); }
        if (payment_status) { query += ` AND o.payment_status = $${paramIndex++}`; params.push(payment_status); }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) c`, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY o.created_at DESC`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT o.*, p.name as product_name, p.description as product_description, p.quality_grade, p.is_organic,
              c.name as category_name,
              fu.name as farmer_name, f.city as farmer_city, f.state as farmer_state, f.farm_size,
              bu.name as buyer_name, b.business_name, b.business_type, b.gst_number
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN farmers f ON o.farmer_id = f.id JOIN users fu ON f.user_id = fu.id
       JOIN buyers b ON o.buyer_id = b.id JOIN users bu ON b.user_id = bu.id
       WHERE o.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify access
        const order = result.rows[0];
        let hasAccess = false;
        if (req.user.user_type === 'farmer') {
            const f = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
            hasAccess = f.rows[0]?.id === order.farmer_id;
        } else if (req.user.user_type === 'buyer') {
            const b = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
            hasAccess = b.rows[0]?.id === order.buyer_id;
        } else if (req.user.user_type === 'admin') {
            hasAccess = true;
        }

        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};

// Update order status (farmer only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        const farmerId = farmerResult.rows[0]?.id;

        const order = await pool.query('SELECT * FROM orders WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (order.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status progression
        const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
        const currentIndex = statusOrder.indexOf(order.rows[0].order_status);
        const newIndex = statusOrder.indexOf(status);

        if (newIndex === -1) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        if (newIndex !== currentIndex + 1 && status !== 'cancelled') {
            return res.status(400).json({ message: `Cannot change status from ${order.rows[0].order_status} to ${status}` });
        }

        const updateData = { order_status: status };
        if (status === 'delivered') updateData.delivered_at = new Date();

        await pool.query(
            `UPDATE orders SET order_status = $1, delivered_at = $2 WHERE id = $3`,
            [status, status === 'delivered' ? new Date() : null, id]
        );

        // Notify buyer
        const buyerUser = await pool.query('SELECT user_id FROM buyers WHERE id = $1', [order.rows[0].buyer_id]);
        if (buyerUser.rows.length > 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, 'order_update', 'Order Status Updated', $2, $3)`,
                [buyerUser.rows[0].user_id, `Your order #${order.rows[0].order_number} is now ${status}`, `/buyer/orders/${id}`]
            );
        }

        res.json({ message: 'Order status updated', status });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

// Process payment (buyer)
exports.processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method } = req.body;

        const buyerResult = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [req.user.id]);
        const buyerId = buyerResult.rows[0]?.id;

        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1 AND buyer_id = $2', [id, buyerId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];
        if (order.payment_status === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        // Generate transaction ID
        const transactionId = generateTransactionId();

        // Update payment status
        await pool.query(
            `UPDATE orders SET payment_status = 'completed', payment_method = $1, transaction_id = $2 WHERE id = $3`,
            [payment_method || 'online', transactionId, id]
        );

        // Generate invoice
        const farmer = await pool.query(
            'SELECT f.*, u.name FROM farmers f JOIN users u ON f.user_id = u.id WHERE f.id = $1',
            [order.farmer_id]
        );
        const buyer = await pool.query(
            'SELECT b.*, u.name FROM buyers b JOIN users u ON b.user_id = u.id WHERE b.id = $1',
            [order.buyer_id]
        );
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [order.product_id]);

        order.transaction_id = transactionId;
        const invoiceUrl = await generateInvoice(order, farmer.rows[0], buyer.rows[0], product.rows[0]);

        await pool.query('UPDATE orders SET invoice_url = $1 WHERE id = $2', [invoiceUrl, id]);

        res.json({ message: 'Payment successful', transaction_id: transactionId, invoice_url: invoiceUrl });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ message: 'Payment failed' });
    }
};

// Download invoice
exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await pool.query('SELECT invoice_url, order_number FROM orders WHERE id = $1', [id]);

        if (order.rows.length === 0 || !order.rows[0].invoice_url) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const filePath = path.join(__dirname, '..', order.rows[0].invoice_url);
        res.download(filePath, `invoice_${order.rows[0].order_number}.pdf`);
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ message: 'Failed to get invoice' });
    }
};
