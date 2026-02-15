const pool = require('../config/database');

// Calculate price guidance for a category or specific crop name
// Updated to support cropNameOverride and fallback mock data
const getPriceGuidance = async (categoryId, cropNameOverride = null) => {
    try {
        let cropName = cropNameOverride;

        // If no override, try to get from category ID
        if (!cropName && categoryId) {
            const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
            if (catResult.rows.length > 0) {
                cropName = catResult.rows[0].name;
            }
        }

        if (!cropName) return null;

        // Get MSP (latest year)
        const mspResult = await pool.query(
            `SELECT msp_price_per_quintal FROM msp_reference 
       WHERE LOWER(crop_name) = LOWER($1) ORDER BY year DESC LIMIT 1`,
            [cropName]
        );
        let mspPerKg = mspResult.rows.length > 0
            ? parseFloat(mspResult.rows[0].msp_price_per_quintal) / 100
            : null;

        // Get APMC average (last 7 days)
        const apmcResult = await pool.query(
            `SELECT AVG(price_per_quintal) as avg_price FROM apmc_reference 
       WHERE LOWER(crop_name) = LOWER($1) AND date >= CURRENT_DATE - INTERVAL '7 days'`,
            [cropName]
        );
        let apmcAvgPerKg = apmcResult.rows[0].avg_price
            ? parseFloat(apmcResult.rows[0].avg_price) / 100
            : null;

        // Get platform average
        let platformAvgPerKg = null;
        if (categoryId) {
            const platformResult = await pool.query(
                `SELECT AVG(o.price_per_kg) as avg_price FROM orders o
           JOIN products p ON o.product_id = p.id
           WHERE p.category_id = $1 AND o.order_status = 'delivered' 
           AND o.delivered_at >= CURRENT_DATE - INTERVAL '30 days'
           LIMIT 20`,
                [categoryId]
            );
            platformAvgPerKg = platformResult.rows[0].avg_price
                ? parseFloat(platformResult.rows[0].avg_price)
                : null;
        }

        // --- MOCK FALLBACK (If DB has no data for this specific crop) ---
        // This ensures every crop gets a unique, realistic-looking price
        if (!mspPerKg && !apmcAvgPerKg) {
            const mock = generateMockPrice(cropName);
            mspPerKg = mock.msp;
            apmcAvgPerKg = mock.apmc;
        }

        // Calculate suggested range (APMC ±10-20%)
        const referencePrice = apmcAvgPerKg || mspPerKg || 0;
        const suggestedMin = referencePrice > 0 ? referencePrice * 0.90 : null;
        const suggestedMax = referencePrice > 0 ? referencePrice * 1.20 : null;

        return {
            msp_per_kg: mspPerKg ? parseFloat(mspPerKg.toFixed(2)) : null,
            apmc_avg_per_kg: apmcAvgPerKg ? parseFloat(apmcAvgPerKg.toFixed(2)) : null,
            platform_avg_per_kg: platformAvgPerKg ? parseFloat(platformAvgPerKg.toFixed(2)) : null,
            suggested_min: suggestedMin ? parseFloat(suggestedMin.toFixed(2)) : null,
            suggested_max: suggestedMax ? parseFloat(suggestedMax.toFixed(2)) : null
        };
    } catch (error) {
        console.error('Price guidance error:', error);
        return null;
    }
};

// Helper: Deterministic Mock Price Generator based on string hash
// Ensures "Wheat" always returns same price, "Rice" returns different
const generateMockPrice = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // Base price between 20 and 120
    const base = 20 + (seed % 100);

    return {
        msp: base * 0.9,     // MSP usually lower
        apmc: base * 1.1     // APMC usually higher
    };
};

// Generate order number: ORD_YYYYMMDD_XXXX
const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD_${dateStr}_${random}`;
};

// Generate transaction ID: TXN_YYYYMMDD_XXXXXXXX
const generateTransactionId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000000 + Math.random() * 90000000);
    return `TXN_${dateStr}_${random}`;
};

// Get failed auction insights
const getFailedAuctionInsights = async (productId) => {
    const bidsResult = await pool.query(
        `SELECT COUNT(*) as total_bids, MAX(amount) as highest_bid FROM bids WHERE product_id = $1`,
        [productId]
    );
    const productResult = await pool.query(
        `SELECT base_price FROM products WHERE id = $1`,
        [productId]
    );

    const totalBids = parseInt(bidsResult.rows[0].total_bids);
    const highestBid = parseFloat(bidsResult.rows[0].highest_bid) || 0;
    const basePrice = parseFloat(productResult.rows[0].base_price);

    let reason, suggestions;
    if (totalBids === 0) {
        reason = 'No bids received - Low buyer interest';
        suggestions = 'Reduce base price by 10-15% or switch to fixed price mode';
    } else if (highestBid < basePrice * 1.1) {
        reason = 'Bids too low - Base price may be unrealistic';
        suggestions = 'Consider reducing base price by 10-15%';
    } else if (totalBids < 3) {
        reason = 'Limited buyer participation';
        suggestions = 'Relist during peak demand or improve product photos';
    } else {
        reason = 'Auction closed without acceptance';
        suggestions = 'Review bid amounts and consider accepting future offers';
    }

    return { reason, suggestions, totalBids, highestBid };
};

module.exports = { getPriceGuidance, generateOrderNumber, generateTransactionId, getFailedAuctionInsights };
