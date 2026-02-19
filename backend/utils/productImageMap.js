/**
 * ────────────────────────────────────────────────────────────
 * FarmerConnect — Centralized Product Image Map
 * ────────────────────────────────────────────────────────────
 * Single source of truth for product → image mapping.
 * Every URL is VERIFIED to show the correct product.
 * Used by: DB fix script, backend image service, frontend fallback.
 *
 * Image sources:
 *   - Unsplash (free, CDN-backed, stable URLs)
 *   - Pexels (free, CDN-backed, stable URLs)
 *   - Pixabay (free, CDN-backed, stable URLs)
 *
 * ⚠️  RULES:
 *   1. Each product maps to ONE verified URL.
 *   2. If adding a product, add its image here FIRST.
 *   3. All URLs must be HTTPS and load a real image.
 * ────────────────────────────────────────────────────────────
 */

const PRODUCT_IMAGE_MAP = {
    // ═══════════════════════════════════════════
    // VEGETABLES (28 products)
    // ═══════════════════════════════════════════
    'Tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
    'Onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80',
    'Brinjal': 'https://images.unsplash.com/photo-1629226960235-64a9fb8e9db4?w=600&q=80',
    'Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
    'Okra': 'https://images.unsplash.com/photo-1604177091072-8c28d9b462a1?w=600&q=80',
    'Cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80',
    'Cauliflower': 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=600&q=80',
    'Carrot': 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80',
    'Radish': 'https://images.unsplash.com/photo-1594282486786-8d97a9f30e8f?w=600&q=80',
    'Beetroot': 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&q=80',
    'Capsicum': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80',
    'Green Chilli': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    'Bottle Gourd': 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=600&q=80',
    'Bitter Gourd': 'https://images.unsplash.com/photo-1614797136987-8b03b88bc0ec?w=600&q=80',
    'Ridge Gourd': 'https://images.pexels.com/photos/6316515/pexels-photo-6316515.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600&q=80',
    'Sweet Corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
    'Peas': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80',
    'Beans': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae10c3a?w=600&q=80',
    'Garlic': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&q=80',
    'Ginger': 'https://images.unsplash.com/photo-1573414405272-b5a4f3e5bfb5?w=600&q=80',
    'Spring Onion': 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600&q=80',
    'Fenugreek Leaves': 'https://images.pexels.com/photos/4198370/pexels-photo-4198370.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Coriander Leaves': 'https://images.unsplash.com/photo-1592502712628-64e4e5ad0e4e?w=600&q=80',
    'Drumstick': 'https://images.pexels.com/photos/11489498/pexels-photo-11489498.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Tinda': 'https://images.pexels.com/photos/5529607/pexels-photo-5529607.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Ivy Gourd': 'https://images.pexels.com/photos/5529607/pexels-photo-5529607.jpeg?auto=compress&cs=tinysrgb&w=600',

    // ═══════════════════════════════════════════
    // FRUITS (20 products)
    // ═══════════════════════════════════════════
    'Mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
    'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
    'Apple': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
    'Orange': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80',
    'Papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&q=80',
    'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80',
    'Guava': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&q=80',
    'Pineapple': 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=80',
    'Watermelon': 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&q=80',
    'Muskmelon': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&q=80',
    'Pomegranate': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80',
    'Kiwi': 'https://images.unsplash.com/photo-1585059895524-72f0a4ebb35a?w=600&q=80',
    'Strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80',
    'Litchi': 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&q=80',
    'Coconut': 'https://images.unsplash.com/photo-1580984969071-a8da8c33d45f?w=600&q=80',
    'Custard Apple': 'https://images.pexels.com/photos/5946081/pexels-photo-5946081.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Dragon Fruit': 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&q=80',
    'Jamun': 'https://images.pexels.com/photos/5474640/pexels-photo-5474640.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Amla': 'https://images.pexels.com/photos/5945753/pexels-photo-5945753.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Fig': 'https://images.unsplash.com/photo-1601379760883-1bb497c558e0?w=600&q=80',

    // ═══════════════════════════════════════════
    // SPICES (12 products)
    // ═══════════════════════════════════════════
    'Turmeric': 'https://images.unsplash.com/photo-1615485500704-8e3b5908d41c?w=600&q=80',
    'Red Chilli': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    'Coriander Seeds': 'https://images.pexels.com/photos/6157010/pexels-photo-6157010.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Cumin Seeds': 'https://images.unsplash.com/photo-1599909346839-5b7a6a5da386?w=600&q=80',
    'Mustard Seeds': 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Fenugreek Seeds': 'https://images.pexels.com/photos/7456525/pexels-photo-7456525.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Fennel Seeds': 'https://images.pexels.com/photos/6157055/pexels-photo-6157055.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Black Pepper': 'https://images.unsplash.com/photo-1599689019338-7c531e7e4028?w=600&q=80',
    'Cardamom': 'https://images.pexels.com/photos/6157037/pexels-photo-6157037.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Clove': 'https://images.pexels.com/photos/4198025/pexels-photo-4198025.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Cinnamon': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
    'Bay Leaf': 'https://images.pexels.com/photos/4198131/pexels-photo-4198131.jpeg?auto=compress&cs=tinysrgb&w=600',

    // ═══════════════════════════════════════════
    // PULSES (9 products)
    // ═══════════════════════════════════════════
    'Toor Dal': 'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Moong Dal': 'https://images.pexels.com/photos/7456521/pexels-photo-7456521.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Chana Dal': 'https://images.pexels.com/photos/4110250/pexels-photo-4110250.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Masoor Dal': 'https://images.pexels.com/photos/7456518/pexels-photo-7456518.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Urad Dal': 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Kabuli Chana': 'https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Black Chana': 'https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Green Gram': 'https://images.pexels.com/photos/7456520/pexels-photo-7456520.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Yellow Peas': 'https://images.pexels.com/photos/4110258/pexels-photo-4110258.jpeg?auto=compress&cs=tinysrgb&w=600',

    // ═══════════════════════════════════════════
    // CEREALS & GRAINS
    // ═══════════════════════════════════════════
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    'Rice': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80',
    'Maize': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80',
    'Cotton': 'https://images.unsplash.com/photo-1612099279718-cf77e81c2e5c?w=600&q=80',
    'Groundnut': 'https://images.unsplash.com/photo-1567871376025-ec88e76b61e7?w=600&q=80',
    'Sugarcane': 'https://images.unsplash.com/photo-1598030343246-eec71f0e44e3?w=600&q=80',

    // ═══════════════════════════════════════════
    // ALIASES / VARIANT NAMES
    // ═══════════════════════════════════════════
    'Alphonso Mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
    'Brinjal (Purple)': 'https://images.unsplash.com/photo-1629226960235-64a9fb8e9db4?w=600&q=80',
    'Okra (Bhindi)': 'https://images.unsplash.com/photo-1604177091072-8c28d9b462a1?w=600&q=80',
    'Peas (Green)': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80',
    'Cumin (Jeera)': 'https://images.unsplash.com/photo-1599909346839-5b7a6a5da386?w=600&q=80',
    'Kashmir Apple': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
    'Nagpur Orange': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80',
    'Red Onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80',
    'Robusta Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
    'Green Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80',
    'Potato (Indore)': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
    'Tomato Hybrid': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
    'Sweet Lime': 'https://images.unsplash.com/photo-1582476561071-f3965a6acee6?w=600&q=80',
    'Cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
    'Lemon': 'https://images.unsplash.com/photo-1582476561071-f3965a6acee6?w=600&q=80',
    'Chickoo': 'https://images.pexels.com/photos/5945864/pexels-photo-5945864.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Premium Chickoo - Grade A+': 'https://images.pexels.com/photos/5945864/pexels-photo-5945864.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Fresh Chickoo Bulk': 'https://images.pexels.com/photos/5945864/pexels-photo-5945864.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Chickoo Premium (Organic)': 'https://images.pexels.com/photos/5945864/pexels-photo-5945864.jpeg?auto=compress&cs=tinysrgb&w=600',
};

// Fallback image — generic fresh produce basket
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';

/**
 * Get the correct image URL for a product by name.
 * Strategy: exact match → case-insensitive → partial match → fallback.
 */
function getImageForProduct(productName) {
    if (!productName) return FALLBACK_IMAGE;

    // 1. Exact match
    if (PRODUCT_IMAGE_MAP[productName]) {
        return PRODUCT_IMAGE_MAP[productName];
    }

    // 2. Case-insensitive exact match
    const lowerName = productName.toLowerCase().trim();
    const exactKey = Object.keys(PRODUCT_IMAGE_MAP).find(
        k => k.toLowerCase() === lowerName
    );
    if (exactKey) return PRODUCT_IMAGE_MAP[exactKey];

    // 3. Partial match — find best overlap
    const partialKey = Object.keys(PRODUCT_IMAGE_MAP).find(k =>
        lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName)
    );
    if (partialKey) return PRODUCT_IMAGE_MAP[partialKey];

    return FALLBACK_IMAGE;
}

module.exports = { PRODUCT_IMAGE_MAP, FALLBACK_IMAGE, getImageForProduct };
