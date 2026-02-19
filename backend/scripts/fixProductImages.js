#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────
 * FarmerConnect — Fix All Product Images
 * ─────────────────────────────────────────────────────────
 * Usage:
 *   node scripts/fixProductImages.js             # Fix all (fast, no AI)
 *   node scripts/fixProductImages.js --dry-run    # Preview only
 *   node scripts/fixProductImages.js --gemini     # Use Gemini AI validation
 *   node scripts/fixProductImages.js --validate   # Validate correct URLs are accessible
 * ─────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { fixAllProductImages, isImageAccessible } = require('../services/imageService');
const { PRODUCT_IMAGE_MAP } = require('../utils/productImageMap');
const pool = require('../config/database');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useGemini = args.includes('--gemini');
const validateUrls = args.includes('--validate');

async function main() {
    try {
        if (validateUrls) {
            // Validate that all URLs in the map are accessible
            console.log('\n🔍 Validating all image URLs in the product map...\n');
            const entries = Object.entries(PRODUCT_IMAGE_MAP);
            let ok = 0, broken = 0;

            for (const [name, url] of entries) {
                const accessible = await isImageAccessible(url);
                if (accessible) {
                    ok++;
                } else {
                    broken++;
                    console.log(`  ❌ BROKEN: ${name} → ${url}`);
                }
            }

            console.log(`\n✅ Accessible: ${ok}  |  ❌ Broken: ${broken}  |  Total: ${entries.length}`);
        } else {
            // Fix all product images
            const result = await fixAllProductImages({ useGemini, dryRun });

            console.log('\n🎉 Image fix complete!');
            console.log(JSON.stringify({
                total: result.total,
                fixed: result.fixed,
                alreadyCorrect: result.skipped,
                errors: result.errors,
                missing: result.missing
            }, null, 2));
        }
    } catch (err) {
        console.error('❌ Fatal error:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
