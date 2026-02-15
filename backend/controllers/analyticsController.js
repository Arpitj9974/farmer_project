const pool = require('../config/database');

// Dashboard analytics
exports.getDashboard = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        // Revenue over time
        const revenueData = await pool.query(
            `SELECT DATE(created_at) as date, SUM(total_amount) as revenue, SUM(commission_amount) as commission, COUNT(*) as orders
       FROM orders WHERE payment_status = 'completed' AND DATE(created_at) BETWEEN $1 AND $2
       GROUP BY DATE(created_at) ORDER BY date`,
            [startDate, endDate]
        );

        // Revenue by selling mode
        const byMode = await pool.query(
            `SELECT p.selling_mode, SUM(o.total_amount) as revenue, COUNT(*) as orders
       FROM orders o JOIN products p ON o.product_id = p.id
       WHERE o.payment_status = 'completed' AND DATE(o.created_at) BETWEEN $1 AND $2
       GROUP BY p.selling_mode`,
            [startDate, endDate]
        );

        // Revenue by category
        const byCategory = await pool.query(
            `SELECT c.name as category, SUM(o.total_amount) as revenue, COUNT(*) as orders
       FROM orders o JOIN products p ON o.product_id = p.id JOIN categories c ON p.category_id = c.id
       WHERE o.payment_status = 'completed' AND DATE(o.created_at) BETWEEN $1 AND $2
       GROUP BY c.name`,
            [startDate, endDate]
        );

        // Order status distribution
        const orderStatus = await pool.query(
            `SELECT order_status, COUNT(*) FROM orders WHERE DATE(created_at) BETWEEN $1 AND $2 GROUP BY order_status`,
            [startDate, endDate]
        );

        // Farmer benefits: avg price vs MSP
        const farmerBenefits = await pool.query(
            `SELECT AVG(o.price_per_kg) as avg_price_per_kg, COUNT(DISTINCT o.farmer_id) as farmers
       FROM orders o WHERE o.order_status = 'delivered' AND DATE(o.delivered_at) BETWEEN $1 AND $2`,
            [startDate, endDate]
        );

        // Get MSP average for comparison
        const mspAvg = await pool.query(`SELECT AVG(msp_price_per_quintal / 100) as msp_avg FROM msp_reference`);

        // Failed auctions
        const failedAuctions = await pool.query(
            `SELECT COUNT(*) FROM products WHERE status = 'bidding_closed' AND selling_mode = 'bidding'
       AND NOT EXISTS (SELECT 1 FROM orders WHERE orders.product_id = products.id)`
        );

        // User growth
        const userGrowth = await pool.query(
            `SELECT DATE(created_at) as date, user_type, COUNT(*) as count
       FROM users WHERE DATE(created_at) BETWEEN $1 AND $2 GROUP BY DATE(created_at), user_type ORDER BY date`,
            [startDate, endDate]
        );

        res.json({
            revenue_over_time: revenueData.rows,
            revenue_by_mode: byMode.rows,
            revenue_by_category: byCategory.rows,
            order_status_distribution: orderStatus.rows,
            farmer_benefits: {
                avg_price: parseFloat(farmerBenefits.rows[0]?.avg_price_per_kg || 0),
                msp_avg: parseFloat(mspAvg.rows[0]?.msp_avg || 0),
                price_above_msp_percent: mspAvg.rows[0]?.msp_avg > 0
                    ? ((farmerBenefits.rows[0]?.avg_price_per_kg - mspAvg.rows[0]?.msp_avg) / mspAvg.rows[0]?.msp_avg * 100).toFixed(1)
                    : 0,
                active_farmers: parseInt(farmerBenefits.rows[0]?.farmers || 0)
            },
            failed_auctions: parseInt(failedAuctions.rows[0].count),
            user_growth: userGrowth.rows
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({ message: 'Failed to load analytics' });
    }
};

// Export CSV
exports.exportCSV = async (req, res) => {
    try {
        const { type } = req.query; // orders, products, users
        let data, headers;

        if (type === 'orders') {
            const result = await pool.query(
                `SELECT o.order_number, p.name as product, o.quantity_kg, o.price_per_kg, o.total_amount, o.commission_amount,
                o.order_status, o.payment_status, o.created_at
         FROM orders o JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC`
            );
            headers = ['Order Number', 'Product', 'Quantity (kg)', 'Price/kg', 'Total', 'Commission', 'Status', 'Payment', 'Date'];
            data = result.rows.map(r => [r.order_number, r.product, r.quantity_kg, r.price_per_kg, r.total_amount, r.commission_amount, r.order_status, r.payment_status, r.created_at]);
        } else if (type === 'products') {
            const result = await pool.query(
                `SELECT p.name, c.name as category, p.quantity_kg, p.selling_mode, COALESCE(p.fixed_price, p.base_price) as price, p.quality_grade, p.status, p.created_at
         FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC`
            );
            headers = ['Name', 'Category', 'Quantity', 'Mode', 'Price', 'Grade', 'Status', 'Date'];
            data = result.rows.map(r => [r.name, r.category, r.quantity_kg, r.selling_mode, r.price, r.quality_grade, r.status, r.created_at]);
        } else {
            const result = await pool.query(`SELECT name, email, user_type, is_verified, created_at FROM users ORDER BY created_at DESC`);
            headers = ['Name', 'Email', 'Type', 'Verified', 'Date'];
            data = result.rows.map(r => [r.name, r.email, r.user_type, r.is_verified, r.created_at]);
        }

        let csv = headers.join(',') + '\n';
        data.forEach(row => { csv += row.map(v => `"${v}"`).join(',') + '\n'; });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type || 'export'}_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ message: 'Failed to export' });
    }
};

// Get daily analytics
exports.getDaily = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await pool.query('SELECT * FROM platform_analytics WHERE metric_date = $1', [targetDate]);
        if (result.rows.length === 0) {
            return res.json({ message: 'No data for this date' });
        }
        res.json({ analytics: result.rows[0] });
    } catch (error) {
        console.error('Get daily analytics error:', error);
        res.status(500).json({ message: 'Failed to get analytics' });
    }
};
