const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'farmer_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

const defaultPassword = 'password123';

const users = [
    {
        email: 'arpit@example.com',
        password: defaultPassword,
        name: 'Arpit',
        user_type: 'farmer',
        details: {
            farm_address: '123 Green Valley',
            city: 'Nagpur',
            state: 'Maharashtra',
            pincode: '440001',
            farm_size: 15.5
        }
    },
    {
        email: 'rani@example.com',
        password: defaultPassword,
        name: 'Rani Sahu',
        user_type: 'farmer',
        details: {
            farm_address: '456 River Side',
            city: 'Nasik',
            state: 'Maharashtra',
            pincode: '422001',
            farm_size: 10.0
        }
    }
];

// High quality images from Pexels/Unsplash that are reliable
const fruitProducts = [
    { name: 'Alphonso Mango', base: 600, qty: 500, img: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Kashmir Apple', base: 180, qty: 1000, img: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Robusta Banana', base: 30, qty: 2000, img: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Nagpur Orange', base: 60, qty: 800, img: 'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Green Grapes', base: 90, qty: 600, img: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Pomegranate', base: 120, qty: 400, img: 'https://images.pexels.com/photos/6157055/pexels-photo-6157055.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Papaya', base: 40, qty: 700, img: 'https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Watermelon', base: 20, qty: 1500, img: 'https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Pineapple', base: 60, qty: 300, img: 'https://images.pexels.com/photos/1166869/pexels-photo-1166869.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Guava', base: 50, qty: 450, img: 'https://images.pexels.com/photos/5945864/pexels-photo-5945864.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Strawberry', base: 250, qty: 100, img: 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Sweet Lime', base: 55, qty: 650, img: 'https://images.pexels.com/photos/5193433/pexels-photo-5193433.jpeg?auto=compress&cs=tinysrgb&w=800' }
];

const vegProducts = [
    { name: 'Red Onion', base: 25, qty: 2000, img: 'https://images.pexels.com/photos/4197444/pexels-photo-4197444.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Potato (Indore)', base: 20, qty: 3000, img: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Tomato Hybrid', base: 30, qty: 1500, img: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Green Chilli', base: 45, qty: 200, img: 'https://images.pexels.com/photos/4197449/pexels-photo-4197449.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Cauliflower', base: 35, qty: 400, img: 'https://images.pexels.com/photos/53588/cauliflower-vegetables-food-healthy-53588.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Cabbage', base: 22, qty: 600, img: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Brinjal (Purple)', base: 40, qty: 350, img: 'https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Okra (Bhindi)', base: 50, qty: 250, img: 'https://images.pexels.com/photos/2583187/pexels-photo-2583187.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Spinach', base: 20, qty: 150, img: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Carrot', base: 35, qty: 800, img: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Capsicum', base: 60, qty: 300, img: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Ginger', base: 120, qty: 100, img: 'https://images.pexels.com/photos/161559/ginger-root-food-herbal-161559.jpeg?auto=compress&cs=tinysrgb&w=800' }
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Inserting Categories...');
        const cats = [
            { name: 'Fruits', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg' },
            { name: 'Vegetables', image: 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg' }
        ];

        const catIds = {};
        for (const c of cats) {
            const res = await client.query(
                `INSERT INTO categories (name, image_url) VALUES ($1, $2) 
                 ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url RETURNING id, name`,
                [c.name, c.image]
            );
            catIds[c.name] = res.rows[0].id;
        }



        console.log('Seeding Products (8 Fixed Price, 4 Bidding)...');
        for (const u of users) {
            // Ensure user logic is same as before to get IDs...
            const userRes = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
            let userId, farmerId;

            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].id;
            } else {
                // Should ideally not happen if we ran previous seed, but handled anyway
                continue; // Skipping user creation validation for brevity as we just did it
            }

            const farmerRes = await client.query('SELECT id FROM farmers WHERE user_id = $1', [userId]);
            if (farmerRes.rows.length > 0) {
                farmerId = farmerRes.rows[0].id;
            } else { continue; }

            const productsToAdd = u.name.includes('Arpit') ? fruitProducts : vegProducts;
            const catId = u.name.includes('Arpit') ? catIds['Fruits'] : catIds['Vegetables'];

            // Loop through 12 products
            for (let i = 0; i < productsToAdd.length; i++) {
                const p = productsToAdd[i];

                // Logic: 8 Direct Sell (Fixed), 4 Bidding
                let selling_mode, fixed_price, base_price, status;

                if (i < 8) {
                    selling_mode = 'fixed_price';
                    fixed_price = p.base * 1.2; // Retail price slightly higher
                    base_price = null;
                    status = 'active';
                } else {
                    selling_mode = 'bidding';
                    fixed_price = null;
                    base_price = p.base;
                    status = 'active';
                }

                // Check if product exists for this farmer
                const existP = await client.query(
                    `SELECT id FROM products WHERE farmer_id = $1 AND name = $2`,
                    [farmerId, p.name]
                );

                let prodId;

                if (existP.rows.length > 0) {
                    // Update existing product
                    prodId = existP.rows[0].id;
                    await client.query(
                        `UPDATE products SET 
                            category_id = $1, 
                            description = $2, 
                            quantity_kg = $3, 
                            selling_mode = $4, 
                            fixed_price = $5, 
                            base_price = $6, 
                            quality_grade = $7, 
                            status = $8,
                            is_organic = $9 
                        WHERE id = $10`,
                        [catId, `Premium quality ${p.name} sourced directly from verified farms.`, p.qty, selling_mode, fixed_price, base_price, 'A', status, true, prodId]
                    );
                    // console.log(`Updated product ${p.name}`);
                } else {
                    // Insert new product
                    const pRes = await client.query(
                        `INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, quality_grade, status, is_organic)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
                        [farmerId, catId, p.name, `Premium quality ${p.name} sourced directly from verified farms.`, p.qty, selling_mode, fixed_price, base_price, 'A', status, true]
                    );
                    prodId = pRes.rows[0].id;
                }

                // Refresh Images (Delete all for this product, then add primary)
                await client.query(`DELETE FROM product_images WHERE product_id = $1`, [prodId]);
                await client.query(
                    `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
                    [prodId, p.img, true]
                );
            }
            console.log(`Seeded/Updated 12 products for ${u.name} (8 Fixed, 4 Bids)`);
        }

        await client.query('COMMIT');
        console.log('Products re-seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
    } finally {
        client.release();
    }
}

seed().then(() => pool.end());
