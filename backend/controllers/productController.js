const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { getPriceGuidance } = require('../utils/priceGuidance');
const { paginate, paginationResponse } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');
const { assignImageOnCreate } = require('../services/imageService');

// Create product
exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get farmer id
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const { name, description, category_id, quantity_kg, selling_mode, fixed_price, base_price, quality_grade, is_organic } = req.body;

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least 1 product image is required' });
        }
        if (req.files.length > 3) {
            return res.status(400).json({ message: 'Maximum 3 images allowed' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert product
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

            // Auto-assign verified image if no images were uploaded
            if (!req.files || req.files.length === 0) {
                await assignImageOnCreate(productId, name);
            }

            res.status(201).json({ message: 'Product created successfully. Pending admin approval.', productId });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Failed to create product' });
    }
};

// Get all products (public)
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

        // Count total
        const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        // Add sorting and pagination
        const sortOptions = { 'price_asc': 'COALESCE(p.fixed_price, p.base_price) ASC', 'price_desc': 'COALESCE(p.fixed_price, p.base_price) DESC', 'quantity_desc': 'p.quantity_kg DESC', 'latest': 'p.created_at DESC' };
        query += ` ORDER BY ${sortOptions[sort] || 'p.created_at DESC'}`;
        const { limit: lim, offset } = paginate(page, limit);
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(lim, offset);

        const result = await pool.query(query, params);
        res.json(paginationResponse(result.rows, total, page, lim));
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

// Get single product
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
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result.rows[0];
        const imagesResult = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [id]);
        product.images = imagesResult.rows;

        // Get bid count if bidding
        if (product.selling_mode === 'bidding') {
            const bidCount = await pool.query('SELECT COUNT(*) FROM bids WHERE product_id = $1', [id]);
            product.bid_count = parseInt(bidCount.rows[0].count);
        }

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Failed to fetch product' });
    }
};

// Get farmer's products
exports.getMyProducts = async (req, res) => {
    try {
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        if (farmerResult.rows.length === 0) {
            return res.status(403).json({ message: 'Farmer profile not found' });
        }
        const farmerId = farmerResult.rows[0].id;

        const { status, category_id, page = 1, limit = 10 } = req.query;
        let query = `SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
                 (SELECT COUNT(*) FROM bids WHERE product_id = p.id AND status = 'active') as active_bids
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
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

// Update product (only if pending_approval)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        const farmerId = farmerResult.rows[0].id;

        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.rows[0].status !== 'pending_approval') {
            return res.status(400).json({ message: 'Can only edit products pending approval' });
        }

        const { name, description, quantity_kg, fixed_price, base_price, quality_grade, is_organic } = req.body;
        await pool.query(
            `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description),
       quantity_kg = COALESCE($3, quantity_kg), fixed_price = COALESCE($4, fixed_price),
       base_price = COALESCE($5, base_price), quality_grade = COALESCE($6, quality_grade),
       is_organic = COALESCE($7, is_organic) WHERE id = $8`,
            [name, description, quantity_kg, fixed_price, base_price, quality_grade, is_organic, id]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const farmerResult = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
        const farmerId = farmerResult.rows[0].id;

        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND farmer_id = $2', [id, farmerId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check for active bids or orders
        const activeBids = await pool.query("SELECT COUNT(*) FROM bids WHERE product_id = $1 AND status = 'active'", [id]);
        const orders = await pool.query('SELECT COUNT(*) FROM orders WHERE product_id = $1', [id]);

        if (parseInt(activeBids.rows[0].count) > 0) {
            return res.status(400).json({ message: 'Cannot delete product with active bids' });
        }
        if (parseInt(orders.rows[0].count) > 0) {
            return res.status(400).json({ message: 'Cannot delete product with orders' });
        }

        // Delete images from filesystem
        const images = await pool.query('SELECT image_url FROM product_images WHERE product_id = $1', [id]);
        for (const img of images.rows) {
            const filePath = path.join(__dirname, '..', img.image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// Get price guidance
exports.getPriceGuidance = async (req, res) => {
    try {
        const { category_id } = req.params;
        const guidance = await getPriceGuidance(category_id);
        if (!guidance) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ guidance });
    } catch (error) {
        console.error('Price guidance error:', error);
        res.status(500).json({ message: 'Failed to get price guidance' });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json({ categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

// Get Farmer Watchlist
exports.getWatchlist = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT price_watchlist FROM farmers WHERE user_id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }
        res.json({ watchlist: result.rows[0].price_watchlist || [] });
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
};

// Update Farmer Watchlist
exports.updateWatchlist = async (req, res) => {
    try {
        const { watchlist } = req.body;
        if (!Array.isArray(watchlist)) {
            return res.status(400).json({ message: 'Invalid watchlist format' });
        }

        await pool.query(
            'UPDATE farmers SET price_watchlist = $1 WHERE user_id = $2',
            [JSON.stringify(watchlist), req.user.id]
        );

        res.json({ message: 'Watchlist updated successfully', watchlist });
    } catch (error) {
        console.error('Update watchlist error:', error);
        res.status(500).json({ message: 'Failed to update watchlist' });
    }
};
