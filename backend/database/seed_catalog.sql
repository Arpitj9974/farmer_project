-- ============================================================
-- FarmerConnect — Catalog Expansion Seed Script
-- Farmers: Rani Sahu (Vegetables), Arpit Jaiswal (Fruits),
--          Damini Gavali (Spices & Pulses)
-- Run this AFTER the initial seed.sql has been applied.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Add 3 new farmer user accounts
-- Password: Password123!@# (same hash as existing farmers)
-- ────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, user_type, name, mobile, is_verified, verification_status) VALUES
('rani.sahu@email.com',   '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Rani Sahu',   '9898123420', true, 'approved'),
('arpit.jaiswal@email.com','$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G','farmer','Arpit Jaiswal','9898123421', true, 'approved'),
('damini.gavali@email.com','$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G','farmer','Damini Gavali','9898123422', true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- STEP 2: Add farmer profiles (linked to the users above)
-- ────────────────────────────────────────────────────────────
INSERT INTO farmers (user_id, farm_address, city, state, pincode, farm_size, overall_rating, total_orders, bank_name, account_number, ifsc_code, account_holder, verified_at)
SELECT id, 'Village Raipur, Ta. Amrapur', 'Gandhinagar', 'Gujarat', '382421', 4.5, 4.7, 30,
       'SBI', '1122334455', 'SBIN0009001', 'Rani Sahu', CURRENT_TIMESTAMP
FROM users WHERE email = 'rani.sahu@email.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO farmers (user_id, farm_address, city, state, pincode, farm_size, overall_rating, total_orders, bank_name, account_number, ifsc_code, account_holder, verified_at)
SELECT id, 'Village Talala, Ta. Talala', 'Junagadh', 'Gujarat', '362150', 6.0, 4.9, 45,
       'HDFC', '5566778899', 'HDFC0009002', 'Arpit Jaiswal', CURRENT_TIMESTAMP
FROM users WHERE email = 'arpit.jaiswal@email.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO farmers (user_id, farm_address, city, state, pincode, farm_size, overall_rating, total_orders, bank_name, account_number, ifsc_code, account_holder, verified_at)
SELECT id, 'Village Sangli, Ta. Sangli', 'Sangli', 'Maharashtra', '416416', 5.0, 4.6, 38,
       'ICICI', '9988776655', 'ICIC0009003', 'Damini Gavali', CURRENT_TIMESTAMP
FROM users WHERE email = 'damini.gavali@email.com'
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- STEP 3: Add all required categories (safe upsert)
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, description, image_url) VALUES
-- Vegetables
('Tomato',          'Fresh red tomatoes, ideal for wholesale and processing.', 'https://images.unsplash.com/photo-1589010588553-46e8e7c21788?w=400'),
('Potato',          'Premium quality potatoes for retail and industrial use.', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'),
('Onion',           'Fresh onions — red and white varieties for bulk buyers.', 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400'),
('Brinjal',         'Fresh purple brinjal (eggplant) from Gujarat farms.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400'),
('Spinach',         'Tender green spinach leaves, freshly harvested.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'),
('Okra',            'Fresh Bhindi (Lady Finger) — crisp, green, export quality.', 'https://images.unsplash.com/photo-1643241641773-ac2e3cfab65d?w=400'),
('Cabbage',         'Fresh green cabbage heads, uniform size.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'),
('Cauliflower',     'White, firm cauliflower, ideal for retail and processing.', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400'),
('Carrot',          'Fresh orange carrots, premium quality, bulk available.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'),
('Radish',          'Crisp white radish from Gujarat farms.', 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400'),
('Beetroot',        'Deep red beetroot — fresh and nutritious.', 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400'),
('Capsicum',        'Colourful bell peppers — green, red, yellow available.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'),
('Green Chilli',    'Fresh green chillies, medium to hot varieties.', 'https://images.unsplash.com/photo-1583119022894-919a5a21ddb7?w=400'),
('Bottle Gourd',    'Fresh Lauki (bottle gourd) — light green, firm.', 'https://images.unsplash.com/photo-1617346867781-f5f5e5ff2e02?w=400'),
('Bitter Gourd',    'Fresh Karela (bitter gourd) — high medicinal value.', 'https://images.unsplash.com/photo-1628089999575-7ac61b36e1a0?w=400'),
('Ridge Gourd',     'Fresh Turai (ridge gourd) — tender and crisp.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400'),
('Pumpkin',         'Large yellow pumpkins — bulk quantity available.', 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400'),
('Sweet Corn',      'Fresh sweet corn cobs — ideal for processing.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'),
('Peas',            'Fresh green peas — shelled and pod varieties.', 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400'),
('Beans',           'Fresh green beans — flat and round varieties.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400'),
('Garlic',          'Strong flavoured dry garlic bulbs for wholesale.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400'),
('Ginger',          'Fresh fibrous ginger root — high oil content.', 'https://images.unsplash.com/photo-1598736736862-6e71dbde93f0?w=400'),
('Spring Onion',    'Tender spring onions — bundle packs for retail.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400'),
('Fenugreek Leaves','Fresh Methi leaves — aromatic and nutritious.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400'),
('Coriander Leaves','Fresh green coriander (Dhania) — bulk bundles.', 'https://images.unsplash.com/photo-1593845677045-ba74d6e45e9b?w=400'),
('Drumstick',       'Fresh Moringa drumstick pods — export quality.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'),
('Tinda',           'Fresh Tinda (round gourd) — Gujarat specialty.', 'https://images.unsplash.com/photo-1617346867781-f5f5e5ff2e02?w=400'),
('Ivy Gourd',       'Fresh Tindora (ivy gourd) — popular in Gujarat.', 'https://images.unsplash.com/photo-1628089999575-7ac61b36e1a0?w=400'),
-- Fruits
('Apple',           'Himachal Pradesh red apples — crisp and sweet.', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400'),
('Orange',          'Fresh Nagpur oranges — juicy and vitamin-rich.', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400'),
('Grapes',          'Thompson and Bangalore blue grape varieties.', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400'),
('Guava',           'Fresh guavas — pink and white flesh varieties.', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400'),
('Pineapple',       'Ripe golden pineapples — ideal for processing.', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400'),
('Watermelon',      'Large sweet watermelons — bulk summer supply.', 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=400'),
('Muskmelon',       'Sweet and fragrant muskmelons for retail.', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400'),
('Pomegranate',     'Bhagwa pomegranates — deep red arils, export quality.', 'https://images.unsplash.com/photo-1541156639-b7e016e86b35?w=400'),
('Kiwi',            'Fresh green kiwi from Himachal Pradesh.', 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400'),
('Strawberry',      'Fresh Mahabaleshwar strawberries — bright red.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'),
('Litchi',          'Sweet and juicy litchi — seasonal premium lot.', 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=400'),
('Coconut',         'Mature and tender coconuts — dual variety bulk.', 'https://images.unsplash.com/photo-1605201100110-1cbedaef5d7b?w=400'),
('Custard Apple',   'Sitaphal (custard apple) — creamy sweet variety.', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400'),
('Dragon Fruit',    'Red and white dragon fruit — premium exotic lot.', 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=400'),
('Jamun',           'Fresh Indian blackberry (Jamun) — seasonal bulk.', 'https://images.unsplash.com/photo-1544025162-d76594e8bb5c?w=400'),
('Amla',            'Indian gooseberry (Amla) — high Vitamin C content.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'),
('Fig',             'Fresh Anjeer (fig) — honey-sweet, export quality.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400'),
-- Spices
('Turmeric',        'Raw and dry turmeric — high curcumin content.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400'),
('Red Chilli',      'Dried red chillies — Kashmiri and Byadagi varieties.', 'https://images.unsplash.com/photo-1583119022894-919a5a21ddb7?w=400'),
('Coriander Seeds', 'Whole coriander (Dhania) seeds for wholesale.', 'https://images.unsplash.com/photo-1593845677045-ba74d6e45e9b?w=400'),
('Cumin Seeds',     'Premium Jeera (cumin) seeds — light green variety.', 'https://images.unsplash.com/photo-1613543000879-9d9aec6dfa4d?w=400'),
('Mustard Seeds',   'Black and yellow mustard seeds in bulk.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400'),
('Fenugreek Seeds', 'Methi seeds — slightly bitter, high in fibre.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400'),
('Fennel Seeds',    'Saunf (fennel seeds) — sweet aromatic variety.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400'),
('Black Pepper',    'Dried black pepper (Kali Mirch) — Wayanad origin.', 'https://images.unsplash.com/photo-1599689019338-7c531e7e4028?w=400'),
('Cardamom',        'Green cardamom (Elaichi) — small, aromatic pods.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400'),
('Clove',           'Whole cloves — strong aromatic spice, dried.', 'https://images.unsplash.com/photo-1575386150878-8e6b66de0eel?w=400'),
('Cinnamon',        'Ceylon cinnamon sticks — fragrant and fresh.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'),
('Bay Leaf',        'Whole dried bay leaves (Tej Patta) for bulk use.', 'https://images.unsplash.com/photo-1625937329935-f4a0f4ecf01e?w=400'),
-- Pulses
('Toor Dal',        'Split pigeon peas — polished, clean, export quality.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400'),
('Moong Dal',       'Split green gram (Moong) — yellow and whole variety.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400'),
('Chana Dal',       'Split Bengal gram (Chana) — hulled, yellow variety.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'),
('Masoor Dal',      'Red lentils (Masoor) — whole and split variety.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400'),
('Urad Dal',        'Black gram (Urad) — whole and split available.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'),
('Kabuli Chana',    'White chickpea (Kabuli Chana) — large grain size.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'),
('Black Chana',     'Desi black chickpea — strong flavour, high protein.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'),
('Green Gram',      'Whole green gram (Moong) — export grade quality.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400'),
('Yellow Peas',     'Dried yellow peas — split and whole bulk supply.', 'https://images.unsplash.com/photo-1563113523-f7765f3a6b29?w=400')
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- STEP 4: Insert products — strictly per farmer
-- Uses subqueries to safely resolve farmer_id and category_id
-- No hardcoded IDs — safe against any DB state
-- ────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════
-- RANI SAHU — VEGETABLES ONLY (all fixed_price)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status)
SELECT
    (SELECT f.id FROM farmers f JOIN users u ON f.user_id = u.id WHERE u.email = 'rani.sahu@email.com'),
    c.id, v.name, v.description, v.qty::numeric, 'fixed_price'::selling_mode_enum,
    v.price::numeric, NULL, 0, v.grade::quality_grade_enum, v.organic::boolean, 'active'
FROM (VALUES
    ('Tomato',           'Farm-fresh grade A+ tomatoes, perfect ripeness for wholesale.',    800,  18.00, 'A+', true),
    ('Potato',           'Premium Jyoti potatoes — uniform size, low moisture.',             1200, 14.00, 'A',  false),
    ('Onion',            'Red Nashik onions — strong pungent variety for bulk export.',      2000, 20.00, 'A',  false),
    ('Brinjal',          'Fresh purple brinjal — Gujarat round variety.',                    500,  22.00, 'A+', false),
    ('Spinach',          'Organic palak (spinach) — freshly harvested bundles.',             300,  28.00, 'A+', true),
    ('Okra',             'Tender Bhindi (lady finger) — green, crisp, no bruising.',         400,  30.00, 'A+', false),
    ('Cabbage',          'Green round cabbage — firm and fresh, export-ready.',              900,  12.00, 'A',  false),
    ('Cauliflower',      'Snow-white cauliflower — uniform curd, no yellowing.',             700,  25.00, 'A+', false),
    ('Carrot',           'Nantes-type orange carrots — crunchy and sweet, no cracks.',       600,  20.00, 'A',  false),
    ('Radish',           'White mooli radish — crisp, no piths, bulk available.',            400,  14.00, 'A',  false),
    ('Beetroot',         'Deep red beetroot — uniform size, high sugar content.',            350,  22.00, 'A+', true),
    ('Capsicum',         'Green and red bell peppers — thick flesh, export quality.',        500,  45.00, 'A+', true),
    ('Green Chilli',     'Medium-hot green chillies — fresh and glossy, no blemish.',        200,  35.00, 'A',  false),
    ('Bottle Gourd',     'Light green Lauki — tender, no seeds, perfect for retail.',        600,  16.00, 'A',  false),
    ('Bitter Gourd',     'Fresh karela — bright green, no yellowing, firm.',                 250,  28.00, 'A',  false),
    ('Ridge Gourd',      'Tender Turai — dark green ridges, freshly cut.',                   300,  18.00, 'A',  false),
    ('Pumpkin',          'Large yellow pumpkins — hard skin, sweet flesh inside.',           1500, 12.00, 'A',  false),
    ('Sweet Corn',       'Hybrid sweet corn cobs — yellow, high sugar content.',             500,  20.00, 'A+', false),
    ('Peas',             'Fresh shelled green peas — sweet, no shrivelling.',                400,  55.00, 'A+', true),
    ('Beans',            'Flat green beans — tender, no strings, farm fresh.',               350,  35.00, 'A',  false),
    ('Garlic',           'Dry white garlic bulbs — strong aroma, clean outer skin.',         300,  90.00, 'A+', false),
    ('Ginger',           'Fresh green ginger — high oil content, fibrous, clean.',           400,  65.00, 'A',  false),
    ('Spring Onion',     'Tender spring onion bunches — bright green tops.',                 200,  30.00, 'A+', true),
    ('Fenugreek Leaves', 'Organic Methi leaves — aromatic, slightly bitter, tender.',        150,  25.00, 'A+', true),
    ('Coriander Leaves', 'Fresh green Dhania bundles — strong fragrance, no wilting.',       200,  20.00, 'A+', true),
    ('Drumstick',        'Moringa drumstick pods — long, firm, no bending.',                 300,  40.00, 'A',  false),
    ('Tinda',            'Round Tinda (apple gourd) — Gujarat specialty variety.',            250,  22.00, 'A',  false),
    ('Ivy Gourd',        'Tindora (ivy gourd) — green, crisp, no yellowing.',                200,  25.00, 'A',  false)
) AS v(name, description, qty, price, grade, organic)
JOIN categories c ON c.name = v.name;

-- ════════════════════════════════════════════════════════════
-- ARPIT JAISWAL — FRUITS: fixed_price rows
-- ════════════════════════════════════════════════════════════
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status)
SELECT
    (SELECT f.id FROM farmers f JOIN users u ON f.user_id = u.id WHERE u.email = 'arpit.jaiswal@email.com'),
    c.id, v.name, v.description, v.qty::numeric, 'fixed_price'::selling_mode_enum,
    v.price::numeric, NULL, 0, v.grade::quality_grade_enum, v.organic::boolean, 'active'
FROM (VALUES
    ('Mango',         'Kesar and Alphonso mangoes — premium aroma, deep yellow pulp.',      600,  85.00,  'A+', false),
    ('Banana',        'Cavendish bananas — uniform yellow, no bruising, export quality.',   1500, 28.00,  'A',  false),
    ('Apple',         'Himachal Red Delicious apples — crisp, firm, Grade A+.',             800,  95.00,  'A+', false),
    ('Orange',        'Nagpur Santra — fully ripe, juicy, loose-skin variety.',             900,  55.00,  'A',  false),
    ('Papaya',        'Red Lady papaya — sweet orange flesh, mature, no bruising.',         700,  32.00,  'A+', false),
    ('Grapes',        'Thompson seedless grapes — green, tight bunches, no shattering.',    500,  75.00,  'A+', true),
    ('Guava',         'Allahabad Safeda guava — round, white flesh, sweet.',                600,  40.00,  'A',  false),
    ('Pineapple',     'Queen variety pineapples — ripe, golden, tropical aroma.',           400,  35.00,  'A',  false),
    ('Watermelon',    'Sugar Baby watermelons — deep red flesh, 8-10 kg average.',          2000, 15.00,  'A',  false),
    ('Muskmelon',     'Kashi Madhu muskmelon — orange flesh, high sweetness.',              800,  22.00,  'A+', false),
    ('Pomegranate',   'Bhagwa pomegranate — bright red arils, thick rind, export grade.',   500,  120.00, 'A+', true),
    ('Kiwi',          'Himachal Allison kiwi — bright green flesh, tangy-sweet.',           300,  180.00, 'A+', false),
    ('Strawberry',    'Mahabaleshwar strawberry — premium red, Grade A, 250g punnets.',     200,  250.00, 'A+', true),
    ('Coconut',       'Mature coconuts — hard shell, white kernel, South Indian origin.',   1000, 20.00,  'A',  false),
    ('Custard Apple', 'Sitaphal — creamy sweet white flesh, natural harvest.',              300,  70.00,  'A+', false),
    ('Jamun',         'Indian blackberry — ripe, deep purple, seasonal special lot.',       200,  80.00,  'A+', false),
    ('Amla',          'Indian gooseberry — firm, green, high Vitamin C content.',           400,  45.00,  'A',  false)
) AS v(name, description, qty, price, grade, organic)
JOIN categories c ON c.name = v.name;

-- ARPIT JAISWAL — FRUITS: bidding rows
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status)
SELECT
    (SELECT f.id FROM farmers f JOIN users u ON f.user_id = u.id WHERE u.email = 'arpit.jaiswal@email.com'),
    c.id, v.name, v.description, v.qty::numeric, 'bidding'::selling_mode_enum,
    NULL, v.base_p::numeric, 0, v.grade::quality_grade_enum, v.organic::boolean, 'active'
FROM (VALUES
    ('Litchi',      'Muzaffarpur litchi — juicy, translucent flesh, seasonal lot.',  400, 60.00,  'A+', false),
    ('Dragon Fruit','Red-skin dragon fruit — bright pink flesh, premium variety.',   250, 120.00, 'A+', true),
    ('Fig',         'Fresh Poona figs — honey-sweet, soft, export ready.',           250, 90.00,  'A+', true)
) AS v(name, description, qty, base_p, grade, organic)
JOIN categories c ON c.name = v.name;

-- ════════════════════════════════════════════════════════════
-- DAMINI GAVALI — SPICES & PULSES: fixed_price rows
-- ════════════════════════════════════════════════════════════
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status)
SELECT
    (SELECT f.id FROM farmers f JOIN users u ON f.user_id = u.id WHERE u.email = 'damini.gavali@email.com'),
    c.id, v.name, v.description, v.qty::numeric, 'fixed_price'::selling_mode_enum,
    v.price::numeric, NULL, 0, v.grade::quality_grade_enum, v.organic::boolean, 'active'
FROM (VALUES
    ('Turmeric',        'Salem / Erode dry turmeric — 5% curcumin, deep yellow, export.', 500,  110.00,  'A+', true),
    ('Red Chilli',      'Byadagi dry red chillies — deep colour, moderate heat, clean.',   400,  145.00,  'A+', false),
    ('Coriander Seeds', 'Eagle variety coriander — double-washed, fragrant, bulk.',        600,  85.00,   'A',  false),
    ('Cumin Seeds',     'Unjha-origin Jeera — bold size, high volatile oil, clean.',       400,  250.00,  'A+', true),
    ('Mustard Seeds',   'Black mustard seeds — small, uniform, no shrivelling.',           700,  70.00,   'A',  false),
    ('Fenugreek Seeds', 'Methi seeds — machine-cleaned, low moisture content.',            350,  90.00,   'A',  false),
    ('Fennel Seeds',    'Sweet saunf — Lucknow variety, bright green, aromatic.',          300,  130.00,  'A+', false),
    ('Clove',           'Whole cloves — long stem, strong essential oil, cleaned.',        100,  800.00,  'A+', false),
    ('Cinnamon',        'True Ceylon cinnamon quills — soft, multi-layered, fragrant.',    120,  350.00,  'A+', false),
    ('Bay Leaf',        'Whole dried bay leaves — Tej Patta, long-leaf variety.',          200,  95.00,   'A',  false),
    ('Toor Dal',        'Machine-polished toor dal — uniform split, no husk, low moisture.',1000, 95.00,  'A',  false),
    ('Moong Dal',       'Yellow moong dal — hulled, clean, low cooking time.',              800,  110.00,  'A+', true),
    ('Chana Dal',       'Split Bengal gram — bold grain, low ash, machine-cleaned.',        900,  88.00,   'A',  false),
    ('Masoor Dal',      'Red lentils — whole and split, uniform colour, no splits.',        700,  92.00,   'A',  false),
    ('Urad Dal',        'Whole black gram — clean, low broken content, export grade.',      600,  120.00,  'A+', false),
    ('Black Chana',     'Desi black chickpea — small, high protein, organic certified.',    450,  80.00,   'A',  true),
    ('Green Gram',      'Whole green moong — bright green skin, export packing.',           600,  105.00,  'A+', true),
    ('Yellow Peas',     'Split yellow peas — smooth, uniform halves, no discolour.',        700,  75.00,   'A',  false)
) AS v(name, description, qty, price, grade, organic)
JOIN categories c ON c.name = v.name;

-- DAMINI GAVALI — SPICES & PULSES: bidding rows
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status)
SELECT
    (SELECT f.id FROM farmers f JOIN users u ON f.user_id = u.id WHERE u.email = 'damini.gavali@email.com'),
    c.id, v.name, v.description, v.qty::numeric, 'bidding'::selling_mode_enum,
    NULL, v.base_p::numeric, 0, v.grade::quality_grade_enum, v.organic::boolean, 'active'
FROM (VALUES
    ('Black Pepper', 'Wayanad black pepper — bold 7mm+, high piperine, dried.',        200, 450.00,  'A+', true),
    ('Cardamom',     'Green cardamom — 7mm bold size, strong aroma, Kerala origin.',    150, 1200.00, 'A+', true),
    ('Kabuli Chana', 'Large white chickpeas — 9mm bold, premium export lot.',           500, 130.00,  'A+', false)
) AS v(name, description, qty, base_p, grade, organic)
JOIN categories c ON c.name = v.name;

-- ────────────────────────────────────────────────────────────
-- STEP 5: Add primary product images
-- Maps each product to a correct high-quality image URL
-- Using category image from categories table as product image
-- ────────────────────────────────────────────────────────────
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT
    p.id,
    COALESCE(c.image_url, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'),
    true
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN farmers f ON p.farmer_id = f.id
JOIN users u ON f.user_id = u.id
WHERE u.email IN ('rani.sahu@email.com', 'arpit.jaiswal@email.com', 'damini.gavali@email.com')
  AND p.id NOT IN (SELECT product_id FROM product_images WHERE is_primary = true);

-- ────────────────────────────────────────────────────────────
-- STEP 6: Validation query — run to verify correctness
-- ────────────────────────────────────────────────────────────
-- SELECT u.name AS farmer, c.name AS category, p.name AS product, p.quality_grade, p.fixed_price, p.status
-- FROM products p
-- JOIN farmers f ON p.farmer_id = f.id
-- JOIN users u ON f.user_id = u.id
-- JOIN categories c ON p.category_id = c.id
-- WHERE u.email IN ('rani.sahu@email.com','arpit.jaiswal@email.com','damini.gavali@email.com')
-- ORDER BY u.name, c.name, p.name;
