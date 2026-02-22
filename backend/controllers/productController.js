const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { getPriceGuidance } = require('../utils/priceGuidance');
const { paginate, paginationResponse } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');
const { assignImageOnCreate } = require('../services/imageService');

// ═══════════════════════════════════════════════════
// CREATE PRODUCT
// ═══════════════════════════════════════════════════
exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Get farmer id — MUST own a farmer profile
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const { name, description, category_id, quantity_kg, selling_mode, fixed_price, base_price, quality_grade, is_organic } = req.body;

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least 1 product image is required' });
        }
        if (req.files.length > 3) {
            return res.status(400).json({ success: false, message: 'Maximum 3 images allowed' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const productResult = await client.query(
                `INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, quality_grade, is_organic, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_approval') RETURNING id`,
                [farmerId, category_id, name, description, quantity_kg, selling_mode,
                    selling_mode === 'fixed_price' ? fixed_price : null,
                    selling_mode === 'bidding' ? base_price : null,
                    quality_grade, is_organic || false]
            );
            const productId = productResult.rows[0].id;

            // Insert images
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = `/uploads/products/${req.files[i].filename}`;
                await client.query(
                    `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
                    [productId, imageUrl, i === 0]
                );
            }

            await client.query('COMMIT');

            if (!req.files || req.files.length === 0) {
                await assignImageOnCreate(productId, name);
            }

            res.status(201).json({ success: true, message: 'Product created successfully. Pending admin approval.', productId });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

// ═══════════════════════════════════════════════════
// GET ALL PRODUCTS (PUBLIC)
// ═══════════════════════════════════════════════════
exports.getProducts = async (req, res) => {
    try {
        const { category_id, selling_mode, min_price, max_price, quality_grade, is_organic, search, sort, page = 1, limit = 12 } = req.query;

        let query = `SELECT p.*, c.name as category_name, u.name as farmer_name, f.city, f.state, f.overall_rating,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
                 FROM products p
                 JOIN categories c ON p.category_id = c.id
                 JOIN farmers f ON p.farmer_id = f.id
                 JOIN users u ON f.user_id = u.id
                 WHERE p.status = 'active'`;
        const params = [];
        let paramIndex = 1;

        if (category_id) { query += ` AND p.category_id = $${paramIndex++}`; params.push(category_id); }
        if (selling_mode) { query += ` AND p.selling_mode = $${paramIndex++}`; params.push(selling_mode); }
        if (quality_grade) { query += ` AND p.quality_grade = $${paramIndex++}`; params.push(quality_grade); }
        if (is_organic === 'true') { query += ` AND p.is_organic = true`; }
        if (min_price) { query += ` AND COALESCE(p.fixed_price, p.base_price) >= $${paramIndex++}`; params.push(min_price); }
        if (max_price) { query += ` AND COALESCE(p.fixed_price, p.base_price) <= $${paramIndex++}`; params.push(max_price); }
        if (search) { query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`; params.push(`%${search}%`); paramIndex++; }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        const sortOptions = { 'price_asc': 'COALESCE(p.fixed_price, p.base_price) ASC', 'price_desc': 'COALESCE(p.fixed_price, p.base_price) DESC', 'quantity_desc': 'p.quantity_kg DESC', 'latest': 'p.created_at DESC' };
        query += ` ORDER BY ${sortOptions[sort] || 'p.created_at DESC'}`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

// ═══════════════════════════════════════════════════
// GET SINGLE PRODUCT
// ═══════════════════════════════════════════════════
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.*, c.name as category_name, u.name as farmer_name, u.id as farmer_user_id,
              f.city, f.state, f.farm_size, f.overall_rating, f.total_orders, f.created_at as farmer_since
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN farmers f ON p.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = result.rows[0];
        const imagesResult = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [id]);
        product.images = imagesResult.rows;

        if (product.selling_mode === 'bidding') {
            const bidCount = await pool.query('SELECT COUNT(*) FROM bids WHERE product_id = $1', [id]);
            product.bid_count = parseInt(bidCount.rows[0].count);

            // Get current highest bid from bids table (system-derived, not manual)
            const highestBid = await pool.query(
                `SELECT MAX(amount) as highest_bid FROM bids WHERE product_id = $1 AND status IN ('active', 'won')`,
                [id]
            );
            product.derived_highest_bid = highestBid.rows[0]?.highest_bid || 0;
        }

        res.json({ success: true, product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
};

// ═══════════════════════════════════════════════════
// GET MY PRODUCTS (FARMER)
// ═══════════════════════════════════════════════════
exports.getMyProducts = async (req, res) => {
    try {
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const { status, category_id, page = 1, limit = 10 } = req.query;
        let query = `SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
                 (SELECT COUNT(*) FROM bids WHERE product_id = p.id AND status = 'active') as active_bids,
                 (SELECT MAX(amount) FROM bids WHERE product_id = p.id AND status IN ('active', 'won')) as derived_highest_bid
                 FROM products p JOIN categories c ON p.category_id = c.id
                 WHERE p.farmer_id = $1`;
        const params = [farmerId];
        let paramIndex = 2;

        if (status) { query += ` AND p.status = $${paramIndex++}`; params.push(status); }
        if (category_id) { query += ` AND p.category_id = $${paramIndex++}`; params.push(category_id); }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as c`, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY p.created_at DESC`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

// ═══════════════════════════════════════════════════
// UPDATE PRODUCT — Enhanced: Farmer can edit active products too
// ═══════════════════════════════════════════════════
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify farmer ownership
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or access denied' });
        }

        const currentProduct = product.rows[0];

        // Cannot edit sold products
        if (currentProduct.status === 'sold') {
            return res.status(400).json({ success: false, message: 'Cannot edit sold products' });
        }

        const { name, description, quantity_kg, fixed_price, base_price, quality_grade, is_organic, status } = req.body;

        // Validate status transitions
        const allowedStatuses = ['active', 'paused', 'pending_approval'];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
        }

        // Price validation
        if (fixed_price !== undefined && fixed_price <= 0) {
            return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
        }
        if (base_price !== undefined && base_price <= 0) {
            return res.status(400).json({ success: false, message: 'Base price must be greater than 0' });
        }
        if (quantity_kg !== undefined && quantity_kg <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
        }

        await pool.query(
            `UPDATE products SET 
             name = COALESCE($1, name), 
             description = COALESCE($2, description),
             quantity_kg = COALESCE($3, quantity_kg), 
             fixed_price = COALESCE($4, fixed_price),
             base_price = COALESCE($5, base_price), 
             quality_grade = COALESCE($6, quality_grade),
             is_organic = COALESCE($7, is_organic),
             status = COALESCE($8, status)
             WHERE id = $9`,
            [name, description, quantity_kg, fixed_price, base_price, quality_grade, is_organic, status, id]
        );

        // Fetch updated product to return
        const updated = await pool.query(
            `SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
             FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
            [id]
        );

        res.json({ success: true, message: 'Product updated successfully', product: updated.rows[0] });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

// ═══════════════════════════════════════════════════
// UPDATE PRODUCT IMAGE — Replace primary image
// ═══════════════════════════════════════════════════
exports.updateProductImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify farmer ownership
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or access denied' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const newImageUrl = `/uploads/products/${req.file.filename}`;

        // Delete old primary image file from filesystem
        const oldImage = await pool.query(
            'SELECT id, image_url FROM product_images WHERE product_id = $1 AND is_primary = true',
            [id]
        );

        if (oldImage.rows.length > 0) {
            const oldPath = path.join(__dirname, '..', oldImage.rows[0].image_url);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Could not delete old image:', e.message); }
            }
            // Update existing primary image record
            await pool.query(
                'UPDATE product_images SET image_url = $1 WHERE id = $2',
                [newImageUrl, oldImage.rows[0].id]
            );
        } else {
            // Insert new primary image
            await pool.query(
                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
                [id, newImageUrl]
            );
        }

        res.json({
            success: true,
            message: 'Product image updated successfully',
            image_url: newImageUrl
        });
    } catch (error) {
        console.error('Update product image error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product image' });
    }
};

// ═══════════════════════════════════════════════════
// DELETE PRODUCT
// ═══════════════════════════════════════════════════
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or access denied' });
        }

        // Check for active bids or orders
        const activeBids = await pool.query("SELECT COUNT(*) FROM bids WHERE product_id = $1 AND status = 'active'", [id]);
        const orders = await pool.query('SELECT COUNT(*) FROM orders WHERE product_id = $1', [id]);

        if (parseInt(activeBids.rows[0].count) > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete product with active bids' });
        }
        if (parseInt(orders.rows[0].count) > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete product with orders' });
        }

        // Delete images from filesystem
        const images = await pool.query('SELECT image_url FROM product_images WHERE product_id = $1', [id]);
        for (const img of images.rows) {
            const filePath = path.join(__dirname, '..', img.image_url);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { console.warn('Could not delete image:', e.message); }
            }
        }

        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

// ═══════════════════════════════════════════════════
// GET FARMER ANALYTICS
// ═══════════════════════════════════════════════════
exports.getFarmerAnalytics = async (req, res) => {
    try {
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        // Product stats
        const productStats = await pool.query(`
            SELECT 
                COUNT(*) as total_products,
                COUNT(*) FILTER (WHERE status = 'active') as active_products,
                COUNT(*) FILTER (WHERE status = 'sold') as sold_products,
                COUNT(*) FILTER (WHERE status = 'pending_approval') as pending_products,
                COUNT(*) FILTER (WHERE is_organic = true) as organic_products
            FROM products WHERE farmer_id = $1
        `, [farmerId]);

        // Revenue stats
        const revenueStats = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(commission_amount), 0) as total_commission,
                COALESCE(SUM(total_amount) - SUM(commission_amount), 0) as net_earnings,
                COALESCE(AVG(price_per_kg), 0) as avg_price_per_kg
            FROM orders WHERE farmer_id = $1 AND order_status = 'delivered'
        `, [farmerId]);

        // Monthly revenue (last 6 months)
        const monthlyRevenue = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month,
                COUNT(*) as orders,
                COALESCE(SUM(total_amount - commission_amount), 0) as earnings
            FROM orders 
            WHERE farmer_id = $1 AND order_status = 'delivered'
            AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month DESC
        `, [farmerId]);

        // Top products by revenue
        const topProducts = await pool.query(`
            SELECT p.name, COUNT(o.id) as order_count, 
                   COALESCE(SUM(o.total_amount - o.commission_amount), 0) as revenue
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.farmer_id = $1 AND o.order_status = 'delivered'
            GROUP BY p.name
            ORDER BY revenue DESC
            LIMIT 5
        `, [farmerId]);

        // Bid activity
        const bidStats = await pool.query(`
            SELECT COUNT(*) as total_bids,
                   COUNT(*) FILTER (WHERE b.status = 'active') as active_bids
            FROM bids b
            JOIN products p ON b.product_id = p.id
            WHERE p.farmer_id = $1
        `, [farmerId]);

        res.json({
            success: true,
            analytics: {
                products: productStats.rows[0],
                revenue: revenueStats.rows[0],
                monthlyRevenue: monthlyRevenue.rows,
                topProducts: topProducts.rows,
                bids: bidStats.rows[0]
            }
        });
    } catch (error) {
        console.error('Farmer analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};

// ═══════════════════════════════════════════════════
// GET PRICE GUIDANCE
// ═══════════════════════════════════════════════════
exports.getPriceGuidance = async (req, res) => {
    try {
        const { category_id } = req.params;
        const guidance = await getPriceGuidance(category_id);
        if (!guidance) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, guidance });
    } catch (error) {
        console.error('Price guidance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get price guidance' });
    }
};

// ═══════════════════════════════════════════════════
// GET CATEGORIES
// ═══════════════════════════════════════════════════
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

// ═══════════════════════════════════════════════════
// GET / UPDATE FARMER WATCHLIST
// ═══════════════════════════════════════════════════
exports.getWatchlist = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT price_watchlist FROM farmers WHERE user_id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Farmer profile not found' });
        }
        res.json({ success: true, watchlist: result.rows[0].price_watchlist || [] });
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch watchlist' });
    }
};

exports.updateWatchlist = async (req, res) => {
    try {
        const { watchlist } = req.body;
        if (!Array.isArray(watchlist)) {
            return res.status(400).json({ success: false, message: 'Invalid watchlist format' });
        }

        await pool.query(
            'UPDATE farmers SET price_watchlist = $1 WHERE user_id = $2',
            [JSON.stringify(watchlist), req.user.id]
        );

        res.json({ success: true, message: 'Watchlist updated successfully', watchlist });
    } catch (error) {
        console.error('Update watchlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to update watchlist' });
    }
};
