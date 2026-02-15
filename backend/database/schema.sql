-- Agricultural B2B Bulk Trading Platform Database Schema
-- PostgreSQL 14+

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS platform_analytics CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS apmc_reference CASCADE;
DROP TABLE IF EXISTS msp_reference CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS selling_mode_enum CASCADE;
DROP TYPE IF EXISTS quality_grade_enum CASCADE;
DROP TYPE IF EXISTS product_status_enum CASCADE;
DROP TYPE IF EXISTS bid_status_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS notification_type_enum CASCADE;

-- Create ENUM types
CREATE TYPE user_type_enum AS ENUM ('farmer', 'buyer', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE selling_mode_enum AS ENUM ('fixed_price', 'bidding');
CREATE TYPE quality_grade_enum AS ENUM ('A+', 'A', 'B');
CREATE TYPE product_status_enum AS ENUM ('pending_approval', 'active', 'sold', 'bidding_closed', 'rejected');
CREATE TYPE bid_status_enum AS ENUM ('active', 'outbid', 'won', 'rejected');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE notification_type_enum AS ENUM ('bid_received', 'bid_outbid', 'bid_won', 'bid_rejected', 'order_update', 'product_approved', 'product_rejected', 'verification_update');

-- 1. Users Table (Core Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type_enum NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status_enum DEFAULT 'pending',
    admin_notes TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmers Table
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    farm_size DECIMAL(10, 2),
    overall_rating DECIMAL(3, 2) DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 5),
    total_orders INTEGER DEFAULT 0,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    account_holder VARCHAR(100),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buyers Table
CREATE TABLE buyers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200),
    business_type VARCHAR(100),
    gst_number VARCHAR(20) UNIQUE,
    gst_verified BOOLEAN DEFAULT FALSE,
    business_address TEXT,
    registration_number VARCHAR(50),
    contact_person VARCHAR(100),
    total_purchases INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products Table (Critical - Dual Selling Modes)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
    selling_mode selling_mode_enum NOT NULL,
    fixed_price DECIMAL(10, 2) CHECK (fixed_price > 0),
    base_price DECIMAL(10, 2) CHECK (base_price > 0),
    current_highest_bid DECIMAL(10, 2) DEFAULT 0,
    quality_grade quality_grade_enum NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    status product_status_enum DEFAULT 'pending_approval',
    rejection_reason TEXT,
    failure_reason TEXT,
    failure_suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_selling_mode CHECK (
        (selling_mode = 'fixed_price' AND fixed_price IS NOT NULL) OR
        (selling_mode = 'bidding' AND base_price IS NOT NULL)
    )
);

-- 6. Product Images Table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bids Table (Critical - Concurrency Safe)
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status bid_status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id),
    farmer_id INTEGER NOT NULL REFERENCES farmers(id),
    buyer_id INTEGER NOT NULL REFERENCES buyers(id),
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg >= 50),
    price_per_kg DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    order_status order_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    invoice_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- 9. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(id),
    buyer_id INTEGER NOT NULL REFERENCES buyers(id),
    farmer_id INTEGER NOT NULL REFERENCES farmers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT CHECK (LENGTH(review_text) >= 10 AND LENGTH(review_text) <= 500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. MSP Reference Table (Government Minimum Support Prices)
CREATE TABLE msp_reference (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    msp_price_per_quintal DECIMAL(10, 2) NOT NULL,
    year INTEGER NOT NULL,
    season VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. APMC Reference Table (Market Prices)
CREATE TABLE apmc_reference (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    market_name VARCHAR(200) NOT NULL,
    price_per_quintal DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Site Settings Table
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Platform Analytics Table
CREATE TABLE platform_analytics (
    id SERIAL PRIMARY KEY,
    metric_date DATE UNIQUE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(15, 2) DEFAULT 0,
    commission_earned DECIMAL(12, 2) DEFAULT 0,
    avg_farmer_price DECIMAL(10, 2) DEFAULT 0,
    avg_buyer_savings DECIMAL(10, 2) DEFAULT 0,
    failed_auctions INTEGER DEFAULT 0,
    active_farmers INTEGER DEFAULT 0,
    active_buyers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_verification_status ON users(verification_status);

CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_farmers_city ON farmers(city);
CREATE INDEX idx_farmers_state ON farmers(state);

CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_buyers_gst_number ON buyers(gst_number);

CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_selling_mode ON products(selling_mode);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

CREATE INDEX idx_bids_product_id ON bids(product_id);
CREATE INDEX idx_bids_buyer_id ON bids(buyer_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_created_at ON bids(created_at);

CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_reviews_farmer_id ON reviews(farmer_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_msp_reference_crop_name ON msp_reference(crop_name);
CREATE INDEX idx_apmc_reference_crop_name ON apmc_reference(crop_name);
CREATE INDEX idx_apmc_reference_date ON apmc_reference(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
