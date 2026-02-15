-- Seed Data for Agricultural B2B Trading Platform
-- Run after schema.sql

-- Clear existing data
TRUNCATE TABLE notifications, platform_analytics, reviews, orders, bids, product_images, products, categories, buyers, farmers, users, site_settings, msp_reference, apmc_reference RESTART IDENTITY CASCADE;

-- Site Settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('commission_rate', '0.05'),
('min_order_kg', '50'),
('max_images_per_product', '3'),
('platform_name', 'FarmerConnect');

-- Admin Users
INSERT INTO users (email, password_hash, user_type, name, mobile, is_verified, verification_status) VALUES
('admin@farmerconnect.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'admin', 'Super Admin', '9876543210', true, 'approved'),
('manager@farmerconnect.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'admin', 'Platform Manager', '9876543211', true, 'approved'),
('support@farmerconnect.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'admin', 'Support Admin', '9876543212', true, 'approved');

-- Farmer Users (Password: Password123!@#)
INSERT INTO users (email, password_hash, user_type, name, mobile, is_verified, verification_status) VALUES
('ramesh.patel@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Ramesh Patel', '9898123401', true, 'approved'),
('suresh.kumar@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Suresh Kumar', '9898123402', true, 'approved'),
('mahesh.desai@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Mahesh Desai', '9898123403', true, 'approved'),
('jayesh.shah@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Jayesh Shah', '9898123404', true, 'approved'),
('kiran.modi@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Kiran Modi', '9898123405', true, 'approved'),
('vishal.patel@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Vishal Patel', '9898123406', true, 'approved'),
('rajesh.sharma@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Rajesh Sharma', '9898123407', true, 'approved'),
('dinesh.parmar@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Dinesh Parmar', '9898123408', true, 'approved'),
('nilesh.joshi@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Nilesh Joshi', '9898123409', true, 'approved'),
('bhavesh.mehta@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Bhavesh Mehta', '9898123410', true, 'approved'),
('ashok.yadav@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Ashok Yadav', '9898123411', false, 'pending'),
('pravin.naik@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Pravin Naik', '9898123412', false, 'pending'),
('govind.singh@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Govind Singh', '9898123413', false, 'pending'),
('mohan.rathod@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Mohan Rathod', '9898123414', false, 'pending'),
('sanjay.trivedi@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Sanjay Trivedi', '9898123415', false, 'pending');

-- Buyer Users
INSERT INTO users (email, password_hash, user_type, name, mobile, is_verified, verification_status) VALUES
('orders@freshjuice.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Amit Sharma', '9898765401', true, 'approved'),
('purchase@gujaratexport.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Priya Patel', '9898765402', true, 'approved'),
('buy@wholesalefruits.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Vikram Singh', '9898765403', true, 'approved'),
('manager@foodprocessing.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Neha Desai', '9898765404', true, 'approved'),
('sourcing@organicfoods.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Rahul Joshi', '9898765405', true, 'approved'),
('purchase@fruitmart.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Sneha Modi', '9898765406', true, 'approved'),
('orders@juicefactory.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Karan Mehta', '9898765407', true, 'approved'),
('buy@exporthouse.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Anita Shah', '9898765408', true, 'approved'),
('sourcing@bigbasket.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Deepak Kumar', '9898765409', true, 'approved'),
('purchase@retailmart.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Meera Patel', '9898765410', true, 'approved'),
('orders@newbuyer1.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Ravi Yadav', '9898765411', false, 'pending'),
('orders@newbuyer2.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'buyer', 'Sunita Sharma', '9898765412', false, 'pending');

-- Farmers Data
INSERT INTO farmers (user_id, farm_address, city, state, pincode, farm_size, overall_rating, total_orders, bank_name, account_number, ifsc_code, account_holder, verified_at) VALUES
(4, 'Village Chikhli, Ta. Chikhli', 'Navsari', 'Gujarat', '396521', 5.5, 4.5, 25, 'SBI', '1234567890', 'SBIN0001234', 'Ramesh Patel', CURRENT_TIMESTAMP),
(5, 'Village Jalalpore, Ta. Jalalpore', 'Navsari', 'Gujarat', '396440', 8.2, 4.8, 32, 'HDFC', '9876543210', 'HDFC0001234', 'Suresh Kumar', CURRENT_TIMESTAMP),
(6, 'Village Maroli, Ta. Navsari', 'Navsari', 'Gujarat', '396436', 3.5, 4.2, 18, 'ICICI', '5678901234', 'ICIC0001234', 'Mahesh Desai', CURRENT_TIMESTAMP),
(7, 'Village Gandevi, Ta. Gandevi', 'Navsari', 'Gujarat', '396360', 6.0, 4.6, 28, 'BOB', '4567890123', 'BARB0001234', 'Jayesh Shah', CURRENT_TIMESTAMP),
(8, 'Village Bilimora, Ta. Gandevi', 'Navsari', 'Gujarat', '396321', 4.0, 4.3, 15, 'SBI', '3456789012', 'SBIN0002345', 'Kiran Modi', CURRENT_TIMESTAMP),
(9, 'Village Valsad, Ta. Valsad', 'Valsad', 'Gujarat', '396001', 7.5, 4.7, 35, 'PNB', '2345678901', 'PUNB0001234', 'Vishal Patel', CURRENT_TIMESTAMP),
(10, 'Village Dharampur, Ta. Dharampur', 'Valsad', 'Gujarat', '396050', 5.0, 4.4, 20, 'Axis', '1234509876', 'UTIB0001234', 'Rajesh Sharma', CURRENT_TIMESTAMP),
(11, 'Village Pardi, Ta. Pardi', 'Valsad', 'Gujarat', '396125', 6.5, 4.1, 22, 'SBI', '6789012345', 'SBIN0003456', 'Dinesh Parmar', CURRENT_TIMESTAMP),
(12, 'Village Umargam, Ta. Umargam', 'Valsad', 'Gujarat', '396165', 4.5, 4.5, 17, 'HDFC', '7890123456', 'HDFC0002345', 'Nilesh Joshi', CURRENT_TIMESTAMP),
(13, 'Village Kaprada, Ta. Kaprada', 'Valsad', 'Gujarat', '396470', 8.0, 4.9, 40, 'ICICI', '8901234567', 'ICIC0002345', 'Bhavesh Mehta', CURRENT_TIMESTAMP),
(14, 'Village Ahwa, Ta. Dang', 'Dang', 'Gujarat', '394730', 3.0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(15, 'Village Waghai, Ta. Dang', 'Dang', 'Gujarat', '394730', 4.5, 0, 0, NULL, NULL, NULL, NULL, NULL),
(16, 'Village Saputara, Ta. Dang', 'Dang', 'Gujarat', '394720', 5.0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(17, 'Village Subir, Ta. Dang', 'Dang', 'Gujarat', '394710', 2.5, 0, 0, NULL, NULL, NULL, NULL, NULL),
(18, 'Village Shamgahan, Ta. Dang', 'Dang', 'Gujarat', '394716', 3.5, 0, 0, NULL, NULL, NULL, NULL, NULL);

-- Buyers Data
INSERT INTO buyers (user_id, business_name, business_type, gst_number, gst_verified, business_address, total_purchases) VALUES
(19, 'Fresh Juice Co.', 'Manufacturer', '24AABCU9603R1ZM', true, 'Industrial Area, Surat, Gujarat', 45),
(20, 'Gujarat Export House', 'Exporter', '24AABCU9603R1ZN', true, 'Export Zone, Ahmedabad, Gujarat', 62),
(21, 'Wholesale Fruits Mart', 'Wholesaler', '24AABCU9603R1ZO', true, 'APMC Yard, Navsari, Gujarat', 38),
(22, 'Food Processing Ltd.', 'Manufacturer', '24AABCU9603R1ZP', true, 'GIDC, Vapi, Gujarat', 55),
(23, 'Organic Foods Pvt Ltd', 'Retailer', '24AABCU9603R1ZQ', true, 'SG Highway, Ahmedabad, Gujarat', 28),
(24, 'Fruit Mart Retail', 'Retailer', '24AABCU9603R1ZR', true, 'Ring Road, Surat, Gujarat', 42),
(25, 'Juice Factory India', 'Manufacturer', '24AABCU9603R1ZS', true, 'Industrial Estate, Vadodara, Gujarat', 35),
(26, 'Export House Trading', 'Exporter', '24AABCU9603R1ZT', true, 'Port Area, Hazira, Gujarat', 50),
(27, 'BigBasket Gujarat', 'E-commerce', '24AABCU9603R1ZU', true, 'Warehouse Zone, Ahmedabad, Gujarat', 70),
(28, 'Retail Mart Chain', 'Retailer', '24AABCU9603R1ZV', true, 'Multiple Locations, Gujarat', 48),
(29, 'New Buyer Corp', 'Wholesaler', NULL, false, 'Navsari, Gujarat', 0),
(30, 'Fresh Start Foods', 'Manufacturer', NULL, false, 'Surat, Gujarat', 0);

-- Categories
INSERT INTO categories (name, description, image_url) VALUES
('Chickoo', 'Premium quality Chickoo (Sapota) from South Gujarat, known for its sweetness and rich flavor.', '/uploads/categories/chickoo.jpg'),
('Mango', 'Fresh Alphonso and Kesar mangoes from the mango belt of Gujarat.', '/uploads/categories/mango.jpg'),
('Banana', 'High-quality Cavendish and local variety bananas, perfect for wholesale.', '/uploads/categories/banana.jpg'),
('Papaya', 'Fresh and ripe papayas, ideal for juice manufacturers and retailers.', '/uploads/categories/papaya.jpg');

-- MSP Reference Data
INSERT INTO msp_reference (crop_name, msp_price_per_quintal, year, season) VALUES
('Chickoo', 3500, 2024, 'Kharif'),
('Mango', 4500, 2024, 'Rabi'),
('Banana', 2800, 2024, 'All Season'),
('Papaya', 2500, 2024, 'All Season');

-- APMC Reference Data (last 15 days)
INSERT INTO apmc_reference (crop_name, market_name, price_per_quintal, date) VALUES
('Chickoo', 'Navsari APMC', 4800, CURRENT_DATE - INTERVAL '1 day'),
('Chickoo', 'Navsari APMC', 4750, CURRENT_DATE - INTERVAL '2 days'),
('Chickoo', 'Navsari APMC', 4900, CURRENT_DATE - INTERVAL '3 days'),
('Chickoo', 'Navsari APMC', 4600, CURRENT_DATE - INTERVAL '4 days'),
('Chickoo', 'Navsari APMC', 4700, CURRENT_DATE - INTERVAL '5 days'),
('Chickoo', 'Surat APMC', 4850, CURRENT_DATE - INTERVAL '1 day'),
('Chickoo', 'Surat APMC', 4800, CURRENT_DATE - INTERVAL '2 days'),
('Mango', 'Navsari APMC', 6500, CURRENT_DATE - INTERVAL '1 day'),
('Mango', 'Navsari APMC', 6400, CURRENT_DATE - INTERVAL '2 days'),
('Mango', 'Navsari APMC', 6600, CURRENT_DATE - INTERVAL '3 days'),
('Mango', 'Ahmedabad APMC', 6800, CURRENT_DATE - INTERVAL '1 day'),
('Banana', 'Navsari APMC', 3200, CURRENT_DATE - INTERVAL '1 day'),
('Banana', 'Navsari APMC', 3100, CURRENT_DATE - INTERVAL '2 days'),
('Banana', 'Navsari APMC', 3250, CURRENT_DATE - INTERVAL '3 days'),
('Papaya', 'Navsari APMC', 2800, CURRENT_DATE - INTERVAL '1 day'),
('Papaya', 'Navsari APMC', 2750, CURRENT_DATE - INTERVAL '2 days'),
('Papaya', 'Surat APMC', 2900, CURRENT_DATE - INTERVAL '1 day');

-- Products (Mix of fixed_price and bidding, various statuses)
INSERT INTO products (farmer_id, category_id, name, description, quantity_kg, selling_mode, fixed_price, base_price, current_highest_bid, quality_grade, is_organic, status) VALUES
-- Active Fixed Price Products
(1, 1, 'Premium Chickoo - Grade A+', 'Fresh, sweet chickoo from our organic farm. Hand-picked for premium quality.', 500, 'fixed_price', 52.00, NULL, 0, 'A+', true, 'active'),
(2, 1, 'Fresh Chickoo Bulk', 'Large quantity chickoo available for immediate dispatch.', 1000, 'fixed_price', 45.00, NULL, 0, 'A', false, 'active'),
(3, 2, 'Alphonso Mango Premium', 'Export quality Alphonso mangoes, perfect ripeness.', 300, 'fixed_price', 85.00, NULL, 0, 'A+', false, 'active'),
(4, 2, 'Kesar Mango Bulk', 'Sweet and aromatic Kesar mangoes from Gandevi farms.', 800, 'fixed_price', 72.00, NULL, 0, 'A', false, 'active'),
(5, 3, 'Cavendish Banana Large', 'Premium quality Cavendish bananas for export.', 1500, 'fixed_price', 28.00, NULL, 0, 'A+', false, 'active'),
(6, 3, 'Local Banana Wholesale', 'Fresh local variety bananas, great for retailers.', 2000, 'fixed_price', 22.00, NULL, 0, 'A', false, 'active'),
(7, 4, 'Red Lady Papaya', 'Sweet and fleshy Red Lady papayas.', 600, 'fixed_price', 32.00, NULL, 0, 'A+', false, 'active'),
(8, 4, 'Papaya Bulk Sale', 'Large quantity papaya for juice manufacturers.', 1200, 'fixed_price', 26.00, NULL, 0, 'A', false, 'active'),
(1, 1, 'Organic Chickoo Special', 'Certified organic chickoo, naturally ripened.', 400, 'fixed_price', 58.00, NULL, 0, 'A+', true, 'active'),
(9, 2, 'Totapuri Mango Bulk', 'Tangy Totapuri mangoes for processing.', 1000, 'fixed_price', 55.00, NULL, 0, 'A', false, 'active'),
(10, 1, 'Chickoo Export Quality', 'APEDA certified export quality chickoo.', 750, 'fixed_price', 62.00, NULL, 0, 'A+', false, 'active'),

-- Active Bidding Products
(1, 1, 'Premium Chickoo Auction Lot', 'Limited quantity premium chickoo for auction. Best quality guaranteed.', 200, 'bidding', NULL, 48.00, 55.00, 'A+', true, 'active'),
(2, 2, 'Alphonso Mango Auction', 'Premium Alphonso lot available for competitive bidding.', 150, 'bidding', NULL, 75.00, 88.00, 'A+', false, 'active'),
(3, 1, 'Chickoo Grade A Bulk Bid', 'Large quantity chickoo, bid for entire lot.', 800, 'bidding', NULL, 42.00, 47.00, 'A', false, 'active'),
(4, 3, 'Banana Premium Lot', 'Export quality banana lot for auction.', 1000, 'bidding', NULL, 25.00, 30.00, 'A+', false, 'active'),
(5, 4, 'Papaya Fresh Lot Auction', 'Fresh papaya lot, competitive bidding open.', 500, 'bidding', NULL, 28.00, 33.00, 'A', false, 'active'),
(6, 2, 'Mango Mixed Variety Bid', 'Mix of Alphonso and Kesar mangoes.', 400, 'bidding', NULL, 65.00, 72.00, 'A', false, 'active'),
(7, 1, 'Organic Chickoo Bid Lot', 'Certified organic chickoo for health-conscious buyers.', 300, 'bidding', NULL, 52.00, 58.00, 'A+', true, 'active'),
(8, 3, 'Banana Wholesale Auction', 'Bulk banana lot for wholesalers.', 2500, 'bidding', NULL, 20.00, 24.00, 'A', false, 'active'),

-- Sold Products
(1, 1, 'Chickoo Lot - Sold', 'This lot has been sold.', 0, 'fixed_price', 50.00, NULL, 0, 'A', false, 'sold'),
(2, 2, 'Mango Premium - Sold', 'Sold to exporter.', 0, 'fixed_price', 80.00, NULL, 0, 'A+', false, 'sold'),
(3, 3, 'Banana Export - Sold', 'Exported via Gujarat Export House.', 0, 'bidding', NULL, 26.00, 32.00, 'A+', false, 'sold'),
(4, 4, 'Papaya Bulk - Sold', 'Sold to juice manufacturer.', 0, 'fixed_price', 30.00, NULL, 0, 'A', false, 'sold'),

-- Bidding Closed (Failed Auctions)
(9, 1, 'Chickoo Auction Failed', 'Auction closed without successful bid.', 300, 'bidding', NULL, 65.00, 0, 'A', false, 'bidding_closed'),
(10, 2, 'Mango Bid Failed', 'No acceptable bids received.', 200, 'bidding', NULL, 95.00, 70.00, 'A+', false, 'bidding_closed'),

-- Pending Approval
(1, 1, 'New Chickoo Listing', 'Fresh listing pending admin approval.', 400, 'fixed_price', 48.00, NULL, 0, 'A', false, 'pending_approval'),
(2, 2, 'New Mango Batch', 'Awaiting verification.', 350, 'bidding', NULL, 70.00, 0, 'A+', false, 'pending_approval'),
(3, 4, 'Papaya New Stock', 'Pending approval for listing.', 600, 'fixed_price', 28.00, NULL, 0, 'A', false, 'pending_approval'),

-- More active products
(9, 1, 'Chickoo Farm Fresh', 'Direct from farm chickoo.', 650, 'fixed_price', 46.00, NULL, 0, 'A', false, 'active'),
(10, 2, 'Mango Hapus Special', 'Ratnagiri Hapus quality.', 280, 'fixed_price', 95.00, NULL, 0, 'A+', false, 'active'),
(1, 3, 'Robusta Banana', 'Robusta variety for processing.', 1800, 'fixed_price', 18.00, NULL, 0, 'B', false, 'active'),
(2, 4, 'Papaya Organic', 'Organically grown papaya.', 420, 'fixed_price', 38.00, NULL, 0, 'A+', true, 'active'),
(4, 1, 'Chickoo Gandevi Premium', 'Famous Gandevi chickoo.', 550, 'bidding', NULL, 55.00, 62.00, 'A+', false, 'active'),
(6, 2, 'Langra Mango Bid', 'North Indian Langra variety.', 320, 'bidding', NULL, 60.00, 68.00, 'A', false, 'active');

-- Product Images (sample - in real app would have actual images)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, '/uploads/products/chickoo-1-main.jpg', true),
(1, '/uploads/products/chickoo-1-2.jpg', false),
(2, '/uploads/products/chickoo-2-main.jpg', true),
(3, '/uploads/products/mango-1-main.jpg', true),
(3, '/uploads/products/mango-1-2.jpg', false),
(4, '/uploads/products/mango-2-main.jpg', true),
(5, '/uploads/products/banana-1-main.jpg', true),
(6, '/uploads/products/banana-2-main.jpg', true),
(7, '/uploads/products/papaya-1-main.jpg', true),
(8, '/uploads/products/papaya-2-main.jpg', true),
(9, '/uploads/products/chickoo-3-main.jpg', true),
(10, '/uploads/products/mango-3-main.jpg', true),
(11, '/uploads/products/chickoo-4-main.jpg', true),
(12, '/uploads/products/chickoo-auction-1.jpg', true),
(13, '/uploads/products/mango-auction-1.jpg', true),
(14, '/uploads/products/chickoo-auction-2.jpg', true),
(15, '/uploads/products/banana-auction-1.jpg', true),
(16, '/uploads/products/papaya-auction-1.jpg', true);

-- Bids for bidding products
INSERT INTO bids (product_id, buyer_id, amount, status) VALUES
-- Product 12 (Chickoo Auction)
(12, 1, 50.00, 'outbid'), (12, 2, 52.00, 'outbid'), (12, 3, 55.00, 'active'),
-- Product 13 (Mango Auction)
(13, 1, 78.00, 'outbid'), (13, 4, 82.00, 'outbid'), (13, 5, 85.00, 'outbid'), (13, 2, 88.00, 'active'),
-- Product 14 (Chickoo Grade A)
(14, 3, 44.00, 'outbid'), (14, 6, 47.00, 'active'),
-- Product 15 (Banana Premium)
(15, 1, 27.00, 'outbid'), (15, 7, 28.00, 'outbid'), (15, 8, 30.00, 'active'),
-- Product 16 (Papaya Auction)
(16, 2, 30.00, 'outbid'), (16, 9, 33.00, 'active'),
-- Product 17 (Mango Mixed)
(17, 3, 68.00, 'outbid'), (17, 10, 72.00, 'active'),
-- Product 18 (Organic Chickoo)
(18, 4, 54.00, 'outbid'), (18, 5, 58.00, 'active'),
-- Product 19 (Banana Wholesale)
(19, 6, 22.00, 'outbid'), (19, 7, 24.00, 'active'),
-- Product 33 (Chickoo Gandevi)
(33, 1, 58.00, 'outbid'), (33, 8, 60.00, 'outbid'), (33, 9, 62.00, 'active'),
-- Product 34 (Langra Mango)
(34, 2, 64.00, 'outbid'), (34, 10, 68.00, 'active');

-- Orders (mix of all statuses)
INSERT INTO orders (order_number, product_id, farmer_id, buyer_id, quantity_kg, price_per_kg, total_amount, commission_amount, order_status, payment_status, payment_method, transaction_id, invoice_url, delivered_at) VALUES
-- Delivered orders
('ORD_20240101_1001', 20, 1, 1, 500, 50.00, 25000.00, 1250.00, 'delivered', 'completed', 'online', 'TXN_20240101_12345001', '/uploads/invoices/invoice_ORD_20240101_1001.pdf', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('ORD_20240102_1002', 21, 2, 2, 300, 80.00, 24000.00, 1200.00, 'delivered', 'completed', 'online', 'TXN_20240102_12345002', '/uploads/invoices/invoice_ORD_20240102_1002.pdf', CURRENT_TIMESTAMP - INTERVAL '23 days'),
('ORD_20240103_1003', 22, 3, 3, 1000, 32.00, 32000.00, 1600.00, 'delivered', 'completed', 'cod', 'TXN_20240103_12345003', '/uploads/invoices/invoice_ORD_20240103_1003.pdf', CURRENT_TIMESTAMP - INTERVAL '21 days'),
('ORD_20240104_1004', 23, 4, 4, 800, 30.00, 24000.00, 1200.00, 'delivered', 'completed', 'online', 'TXN_20240104_12345004', '/uploads/invoices/invoice_ORD_20240104_1004.pdf', CURRENT_TIMESTAMP - INTERVAL '19 days'),
('ORD_20240105_1005', 1, 1, 5, 200, 52.00, 10400.00, 520.00, 'delivered', 'completed', 'online', 'TXN_20240105_12345005', '/uploads/invoices/invoice_ORD_20240105_1005.pdf', CURRENT_TIMESTAMP - INTERVAL '17 days'),
('ORD_20240106_1006', 2, 2, 6, 500, 45.00, 22500.00, 1125.00, 'delivered', 'completed', 'cod', 'TXN_20240106_12345006', '/uploads/invoices/invoice_ORD_20240106_1006.pdf', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('ORD_20240107_1007', 3, 3, 7, 150, 85.00, 12750.00, 637.50, 'delivered', 'completed', 'online', 'TXN_20240107_12345007', '/uploads/invoices/invoice_ORD_20240107_1007.pdf', CURRENT_TIMESTAMP - INTERVAL '13 days'),
('ORD_20240108_1008', 4, 4, 8, 400, 72.00, 28800.00, 1440.00, 'delivered', 'completed', 'online', 'TXN_20240108_12345008', '/uploads/invoices/invoice_ORD_20240108_1008.pdf', CURRENT_TIMESTAMP - INTERVAL '11 days'),
('ORD_20240109_1009', 5, 5, 9, 800, 28.00, 22400.00, 1120.00, 'delivered', 'completed', 'cod', 'TXN_20240109_12345009', '/uploads/invoices/invoice_ORD_20240109_1009.pdf', CURRENT_TIMESTAMP - INTERVAL '9 days'),
('ORD_20240110_1010', 6, 6, 10, 1000, 22.00, 22000.00, 1100.00, 'delivered', 'completed', 'online', 'TXN_20240110_12345010', '/uploads/invoices/invoice_ORD_20240110_1010.pdf', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('ORD_20240111_1011', 7, 7, 1, 300, 32.00, 9600.00, 480.00, 'delivered', 'completed', 'online', 'TXN_20240111_12345011', '/uploads/invoices/invoice_ORD_20240111_1011.pdf', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('ORD_20240112_1012', 8, 8, 2, 600, 26.00, 15600.00, 780.00, 'delivered', 'completed', 'cod', 'TXN_20240112_12345012', '/uploads/invoices/invoice_ORD_20240112_1012.pdf', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('ORD_20240113_1013', 9, 1, 3, 200, 58.00, 11600.00, 580.00, 'delivered', 'completed', 'online', 'TXN_20240113_12345013', '/uploads/invoices/invoice_ORD_20240113_1013.pdf', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('ORD_20240114_1014', 10, 9, 4, 500, 55.00, 27500.00, 1375.00, 'delivered', 'completed', 'online', 'TXN_20240114_12345014', '/uploads/invoices/invoice_ORD_20240114_1014.pdf', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('ORD_20240115_1015', 11, 10, 5, 350, 62.00, 21700.00, 1085.00, 'delivered', 'completed', 'cod', 'TXN_20240115_12345015', '/uploads/invoices/invoice_ORD_20240115_1015.pdf', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('ORD_20240116_1016', 29, 9, 6, 400, 46.00, 18400.00, 920.00, 'delivered', 'completed', 'online', 'TXN_20240116_12345016', '/uploads/invoices/invoice_ORD_20240116_1016.pdf', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('ORD_20240117_1017', 30, 10, 7, 150, 95.00, 14250.00, 712.50, 'delivered', 'completed', 'online', 'TXN_20240117_12345017', '/uploads/invoices/invoice_ORD_20240117_1017.pdf', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('ORD_20240118_1018', 31, 1, 8, 1000, 18.00, 18000.00, 900.00, 'delivered', 'completed', 'cod', 'TXN_20240118_12345018', '/uploads/invoices/invoice_ORD_20240118_1018.pdf', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('ORD_20240119_1019', 32, 2, 9, 200, 38.00, 7600.00, 380.00, 'delivered', 'completed', 'online', 'TXN_20240119_12345019', '/uploads/invoices/invoice_ORD_20240119_1019.pdf', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('ORD_20240120_1020', 1, 1, 10, 100, 52.00, 5200.00, 260.00, 'delivered', 'completed', 'online', 'TXN_20240120_12345020', '/uploads/invoices/invoice_ORD_20240120_1020.pdf', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- Ready orders
('ORD_20240121_1021', 2, 2, 1, 250, 45.00, 11250.00, 562.50, 'ready', 'completed', 'online', 'TXN_20240121_12345021', '/uploads/invoices/invoice_ORD_20240121_1021.pdf', NULL),
('ORD_20240122_1022', 3, 3, 2, 100, 85.00, 8500.00, 425.00, 'ready', 'completed', 'cod', NULL, NULL, NULL),
('ORD_20240123_1023', 4, 4, 3, 200, 72.00, 14400.00, 720.00, 'ready', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240124_1024', 5, 5, 4, 500, 28.00, 14000.00, 700.00, 'ready', 'completed', 'online', 'TXN_20240124_12345024', '/uploads/invoices/invoice_ORD_20240124_1024.pdf', NULL),
('ORD_20240125_1025', 6, 6, 5, 600, 22.00, 13200.00, 660.00, 'ready', 'pending', NULL, NULL, NULL, NULL),

-- Preparing orders
('ORD_20240126_1026', 7, 7, 6, 150, 32.00, 4800.00, 240.00, 'preparing', 'completed', 'online', 'TXN_20240126_12345026', '/uploads/invoices/invoice_ORD_20240126_1026.pdf', NULL),
('ORD_20240127_1027', 8, 8, 7, 400, 26.00, 10400.00, 520.00, 'preparing', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240128_1028', 9, 1, 8, 100, 58.00, 5800.00, 290.00, 'preparing', 'completed', 'cod', NULL, NULL, NULL),
('ORD_20240129_1029', 10, 9, 9, 300, 55.00, 16500.00, 825.00, 'preparing', 'pending', NULL, NULL, NULL, NULL),

-- Confirmed orders
('ORD_20240130_1030', 11, 10, 10, 200, 62.00, 12400.00, 620.00, 'confirmed', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240131_1031', 29, 9, 1, 150, 46.00, 6900.00, 345.00, 'confirmed', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240201_1032', 30, 10, 2, 80, 95.00, 7600.00, 380.00, 'confirmed', 'completed', 'online', 'TXN_20240201_12345032', '/uploads/invoices/invoice_ORD_20240201_1032.pdf', NULL),

-- Pending orders
('ORD_20240202_1033', 31, 1, 3, 500, 18.00, 9000.00, 450.00, 'pending', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240203_1034', 32, 2, 4, 100, 38.00, 3800.00, 190.00, 'pending', 'pending', NULL, NULL, NULL, NULL),
('ORD_20240204_1035', 1, 1, 5, 50, 52.00, 2600.00, 130.00, 'pending', 'pending', NULL, NULL, NULL, NULL);

-- Reviews
INSERT INTO reviews (order_id, buyer_id, farmer_id, rating, review_text) VALUES
(1, 1, 1, 5, 'Excellent quality chickoo! Fresh and sweet. Will definitely order again.'),
(2, 2, 2, 5, 'Premium quality mangoes as described. Fast delivery and well packed.'),
(3, 3, 3, 4, 'Good bananas for processing. Slightly underripe but acceptable.'),
(4, 4, 4, 5, 'Perfect papayas for our juice factory. Great consistency in quality.'),
(5, 5, 1, 4, 'Good organic chickoo. Slightly smaller size but very sweet.'),
(6, 6, 2, 5, 'Bulk order fulfilled perfectly. Excellent farmer to work with.'),
(7, 7, 3, 5, 'Outstanding Alphonso mangoes. Export quality confirmed.'),
(8, 8, 4, 4, 'Kesar mangoes were good. Minor quality variations in batch.'),
(9, 9, 5, 5, 'Best Cavendish bananas we have sourced. Highly recommended.'),
(10, 10, 6, 4, 'Local bananas were fresh. Good for retail sales.'),
(11, 1, 7, 5, 'Red Lady papaya quality was exceptional. Sweet and fleshy.'),
(12, 2, 8, 4, 'Bulk papaya order fulfilled on time. Good cooperation.'),
(13, 3, 1, 5, 'Organic chickoo certification verified. Premium quality.'),
(14, 4, 9, 5, 'Totapuri mangoes perfect for processing. Great acidity level.'),
(15, 5, 10, 5, 'Export quality chickoo. APEDA standards met perfectly.'),
(16, 6, 9, 4, 'Farm fresh chickoo was good. Minor delays in dispatch.'),
(17, 7, 10, 5, 'Hapus quality exceeded expectations. Will reorder.'),
(18, 8, 1, 4, 'Robusta bananas good for processing. Fair pricing.'),
(19, 9, 2, 5, 'Organic papaya was excellent. Customers loved it.'),
(20, 10, 1, 5, 'Quick delivery and top quality chickoo. Highly satisfied.');

-- Platform Analytics (last 30 days)
INSERT INTO platform_analytics (metric_date, total_orders, total_value, commission_earned, avg_farmer_price, avg_buyer_savings, failed_auctions, active_farmers, active_buyers)
SELECT 
  CURRENT_DATE - (gs.day || ' days')::INTERVAL,
  FLOOR(5 + RANDOM() * 10),
  FLOOR(50000 + RANDOM() * 100000),
  FLOOR(2500 + RANDOM() * 5000),
  FLOOR(35 + RANDOM() * 30),
  FLOOR(5 + RANDOM() * 15),
  FLOOR(RANDOM() * 3),
  FLOOR(5 + RANDOM() * 8),
  FLOOR(4 + RANDOM() * 8)
FROM generate_series(1, 30) as gs(day);

-- Sample notifications
INSERT INTO notifications (user_id, type, title, message, link) VALUES
(4, 'order_update', 'New Order Received', 'You have received a new order for Premium Chickoo', '/farmer/orders/35'),
(4, 'bid_received', 'New Bid on Your Product', 'A buyer has placed a bid of ₹55/kg on your chickoo auction', '/farmer/products/12/bids'),
(19, 'order_update', 'Order Status Updated', 'Your order ORD_20240121_1021 is ready for pickup', '/buyer/orders/21'),
(20, 'bid_won', 'Congratulations! You Won the Auction', 'Your bid of ₹88/kg on Alphonso Mango was accepted', '/buyer/orders/2'),
(5, 'product_approved', 'Product Approved', 'Your product Fresh Chickoo Bulk is now live', '/farmer/products/2'),
(14, 'verification_update', 'Verification Pending', 'Your account verification is under review', '/profile');

-- Update failed auction products with insights
UPDATE products SET failure_reason = 'No bids received - Low buyer interest', failure_suggestions = 'Reduce base price by 10-15% or switch to fixed price mode' WHERE id = 24;
UPDATE products SET failure_reason = 'Bids too low - Base price may be unrealistic', failure_suggestions = 'Consider reducing base price by 10-15%' WHERE id = 25;
