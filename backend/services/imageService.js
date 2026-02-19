/**
 * ────────────────────────────────────────────────────────────
 * FarmerConnect — Intelligent Image Service (Gemini + Auto-Fetch)
 * ────────────────────────────────────────────────────────────
 * 
 * Features:
 *   1. Auto-assigns correct image to every product
 *   2. Uses Gemini AI to validate image–product match
 *   3. Fetches images from Unsplash/Pexels API when needed
 *   4. Stores verified image URLs in database permanently
 *   5. Prevents future wrong/missing images
 * 
 * Usage:
 *   const { fixAllProductImages, validateAndAssignImage } = require('./imageService');
 *   await fixAllProductImages();              // Fix all existing products
 *   await validateAndAssignImage(productId);  // Fix one product
 * ────────────────────────────────────────────────────────────
 */

const pool = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { PRODUCT_IMAGE_MAP, FALLBACK_IMAGE, getImageForProduct } = require('../utils/productImageMap');

// ─── Gemini AI Setup ────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI, geminiModel;

function initGemini() {
    if (!GEMINI_API_KEY) {
        console.warn('[ImageService] GEMINI_API_KEY not set — AI validation disabled');
        return false;
    }
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        return true;
    } catch (err) {
        console.error('[ImageService] Failed to init Gemini:', err.message);
        return false;
    }
}

// ─── Gemini: Validate image matches product name ────────────
async function validateImageWithGemini(imageUrl, productName, category) {
    if (!geminiModel) {
        if (!initGemini()) return { valid: true, reason: 'AI unavailable — skipping validation' };
    }

    try {
        // Fetch image as base64
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: { 'User-Agent': 'FarmerConnect/1.0' }
        });

        const base64Image = Buffer.from(response.data).toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';

        const prompt = `You are a product image validator for an agricultural e-commerce platform.

Product Name: "${productName}"
Category: "${category || 'Unknown'}"

Look at this image carefully. Does this image actually show "${productName}"?

Rules:
- If the image shows "${productName}" (the product itself), respond: YES
- If the image shows a DIFFERENT product (wrong product), respond: NO
- If the image is blurry, broken, or unrelated, respond: NO

Respond in exactly this format:
MATCH: YES or NO
REASON: <one line explanation>
SUGGESTED_SEARCH: <if NO, suggest a better search query for finding "${productName}">`;

        const result = await geminiModel.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            }
        ]);

        const text = result.response.text();
        const matchLine = text.split('\n').find(l => l.startsWith('MATCH:'));
        const reasonLine = text.split('\n').find(l => l.startsWith('REASON:'));
        const searchLine = text.split('\n').find(l => l.startsWith('SUGGESTED_SEARCH:'));

        const isValid = matchLine ? matchLine.includes('YES') : true;
        const reason = reasonLine ? reasonLine.replace('REASON:', '').trim() : 'Unknown';
        const suggestedSearch = searchLine ? searchLine.replace('SUGGESTED_SEARCH:', '').trim() : null;

        console.log(`[Gemini] ${productName}: ${isValid ? '✅ MATCH' : '❌ MISMATCH'} — ${reason}`);

        return { valid: isValid, reason, suggestedSearch };
    } catch (err) {
        console.error(`[Gemini] Validation error for ${productName}:`, err.message);
        return { valid: true, reason: 'Validation error — accepting by default' };
    }
}

// ─── Check if an image URL is accessible ────────────────────
async function isImageAccessible(url) {
    try {
        const response = await axios.head(url, {
            timeout: 8000,
            headers: { 'User-Agent': 'FarmerConnect/1.0' },
            maxRedirects: 5,
        });
        const ct = response.headers['content-type'] || '';
        return response.status === 200 && ct.includes('image');
    } catch {
        return false;
    }
}

// ─── Fetch image from Pexels API ────────────────────────────
async function fetchFromPexels(searchQuery) {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    if (!PEXELS_API_KEY) return null;

    try {
        const response = await axios.get('https://api.pexels.com/v1/search', {
            params: { query: searchQuery, per_page: 5, orientation: 'landscape' },
            headers: { Authorization: PEXELS_API_KEY },
            timeout: 10000,
        });

        if (response.data.photos && response.data.photos.length > 0) {
            // Return medium-sized image
            return response.data.photos[0].src.medium;
        }
    } catch (err) {
        console.error(`[Pexels] Search failed for "${searchQuery}":`, err.message);
    }
    return null;
}

// ─── Fetch image from Unsplash API ──────────────────────────
async function fetchFromUnsplash(searchQuery) {
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_KEY) return null;

    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query: searchQuery, per_page: 5, orientation: 'squarish' },
            headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
            timeout: 10000,
        });

        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0].urls.regular;
        }
    } catch (err) {
        console.error(`[Unsplash] Search failed for "${searchQuery}":`, err.message);
    }
    return null;
}

// ─── Auto-fetch: Try multiple sources to find image ─────────
async function autoFetchImage(productName, category) {
    const searchQueries = [
        `${productName} fresh ${category || 'produce'} product`,
        `${productName} raw natural`,
        productName,
    ];

    for (const query of searchQueries) {
        // Try Pexels first (generally better for Indian produce)
        let url = await fetchFromPexels(query);
        if (url) {
            const accessible = await isImageAccessible(url);
            if (accessible) return url;
        }

        // Try Unsplash as fallback
        url = await fetchFromUnsplash(query);
        if (url) {
            const accessible = await isImageAccessible(url);
            if (accessible) return url;
        }
    }

    return null;
}

// ─── Core: Validate and assign image for a single product ───
async function validateAndAssignImage(productId) {
    const result = await pool.query(`
        SELECT p.id, p.name, c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as current_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
    `, [productId]);

    if (result.rows.length === 0) {
        return { success: false, error: 'Product not found' };
    }

    const product = result.rows[0];
    const productName = product.name;
    const category = product.category_name;

    console.log(`\n[ImageService] Processing: ${productName} (ID: ${productId})`);

    // Step 1: Get correct image from centralized map
    let correctImageUrl = getImageForProduct(productName);

    // Step 2: Check if current image is correct
    if (product.current_image === correctImageUrl) {
        console.log(`  → Already correct ✅`);
        return { success: true, action: 'already_correct', url: correctImageUrl };
    }

    // Step 3: Verify the map URL is accessible
    let isAccessible = await isImageAccessible(correctImageUrl);

    // Step 4: If map URL is broken, try auto-fetch
    if (!isAccessible || correctImageUrl === FALLBACK_IMAGE) {
        console.log(`  → Map URL broken or fallback. Auto-fetching...`);
        const fetchedUrl = await autoFetchImage(productName, category);
        if (fetchedUrl) {
            correctImageUrl = fetchedUrl;
            isAccessible = true;
            console.log(`  → Auto-fetched: ${correctImageUrl}`);
        }
    }

    // Step 5: Validate with Gemini AI (if enabled)
    if (isAccessible && correctImageUrl !== FALLBACK_IMAGE) {
        const validation = await validateImageWithGemini(correctImageUrl, productName, category);
        if (!validation.valid) {
            console.log(`  → Gemini rejected. Trying auto-fetch with suggestion...`);
            const searchQuery = validation.suggestedSearch || `${productName} ${category} fresh`;
            const newUrl = await autoFetchImage(productName, category);
            if (newUrl) {
                // Validate the new one too
                const recheck = await validateImageWithGemini(newUrl, productName, category);
                if (recheck.valid) {
                    correctImageUrl = newUrl;
                } else {
                    console.log(`  → Second image also rejected. Using map fallback.`);
                }
            }
        }
    }

    // Step 6: Use fallback if nothing else works
    if (!isAccessible) {
        console.log(`  → All sources failed. Using fallback.`);
        correctImageUrl = FALLBACK_IMAGE;
    }

    // Step 7: Update database
    const existing = await pool.query(
        'SELECT id FROM product_images WHERE product_id = $1 AND is_primary = true',
        [productId]
    );

    if (existing.rows.length > 0) {
        await pool.query(
            'UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true',
            [correctImageUrl, productId]
        );
        console.log(`  → Updated ✅`);
    } else {
        await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
            [productId, correctImageUrl]
        );
        console.log(`  → Inserted ✅`);
    }

    return { success: true, action: 'updated', url: correctImageUrl };
}

// ─── Fix ALL product images in database ─────────────────────
async function fixAllProductImages(options = {}) {
    const { useGemini = false, dryRun = false } = options;

    console.log('\n══════════════════════════════════════════════');
    console.log(' FarmerConnect — Product Image Fix Script');
    console.log('══════════════════════════════════════════════');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'} | Gemini: ${useGemini ? 'ON' : 'OFF'}`);
    console.log('──────────────────────────────────────────────\n');

    if (useGemini) initGemini();

    // Get all products with their current images
    const result = await pool.query(`
        SELECT p.id, p.name, c.name as category_name,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as current_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
    `);

    const products = result.rows;
    let fixed = 0, skipped = 0, errors = 0, missing = 0;
    const report = [];

    for (const product of products) {
        const correctUrl = getImageForProduct(product.name);

        // Check if image needs fixing
        const currentUrl = product.current_image;
        const needsFix = !currentUrl || currentUrl !== correctUrl;

        if (!needsFix) {
            skipped++;
            continue;
        }

        const entry = {
            id: product.id,
            name: product.name,
            category: product.category_name,
            oldUrl: currentUrl || '(missing)',
            newUrl: correctUrl,
            status: 'pending'
        };

        if (!currentUrl) missing++;

        if (dryRun) {
            entry.status = 'would_update';
            report.push(entry);
            fixed++;
            continue;
        }

        try {
            // Update or insert image
            if (currentUrl) {
                await pool.query(
                    'UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true',
                    [correctUrl, product.id]
                );
            } else {
                await pool.query(
                    'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
                    [product.id, correctUrl]
                );
            }

            // Gemini validation (optional, slow)
            if (useGemini && correctUrl !== FALLBACK_IMAGE) {
                const validation = await validateImageWithGemini(correctUrl, product.name, product.category_name);
                entry.geminiResult = validation.valid ? 'APPROVED' : 'REJECTED';
                entry.geminiReason = validation.reason;

                if (!validation.valid) {
                    // Try to auto-fetch a better image
                    const betterUrl = await autoFetchImage(product.name, product.category_name);
                    if (betterUrl) {
                        await pool.query(
                            'UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true',
                            [betterUrl, product.id]
                        );
                        entry.newUrl = betterUrl;
                        entry.status = 'auto_fetched';
                    }
                }
            }

            entry.status = 'fixed';
            fixed++;
        } catch (err) {
            entry.status = 'error';
            entry.error = err.message;
            errors++;
        }

        report.push(entry);
    }

    console.log('\n══════════════════════════════════════════════');
    console.log(' FIX REPORT');
    console.log('══════════════════════════════════════════════');
    console.log(`Total products:  ${products.length}`);
    console.log(`Already correct: ${skipped}`);
    console.log(`Fixed:           ${fixed}`);
    console.log(`Had missing img: ${missing}`);
    console.log(`Errors:          ${errors}`);
    console.log('──────────────────────────────────────────────');

    if (report.length > 0) {
        console.log('\nChanges:');
        report.forEach(r => {
            const icon = r.status === 'fixed' || r.status === 'would_update' ? '✅' : '❌';
            console.log(`  ${icon} ${r.name} (${r.category})`);
            if (r.status === 'error') console.log(`     Error: ${r.error}`);
        });
    }

    return { total: products.length, fixed, skipped, errors, missing, report };
}

// ─── Hook into product creation ─────────────────────────────
async function assignImageOnCreate(productId, productName) {
    const correctUrl = getImageForProduct(productName);

    // Check if product already has an image (from upload)
    const existing = await pool.query(
        'SELECT id FROM product_images WHERE product_id = $1',
        [productId]
    );

    // Only auto-assign if no image was uploaded
    if (existing.rows.length === 0) {
        await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
            [productId, correctUrl]
        );
        console.log(`[ImageService] Auto-assigned image for ${productName}: ${correctUrl}`);
    }
}

module.exports = {
    validateAndAssignImage,
    fixAllProductImages,
    assignImageOnCreate,
    validateImageWithGemini,
    autoFetchImage,
    isImageAccessible,
    getImageForProduct,
};
