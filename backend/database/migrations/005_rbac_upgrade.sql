-- Migration 005: RBAC Upgrade — Add new roles and user profile fields
-- UP

-- 1. Add new roles to user_type_enum
-- PostgreSQL requires ALTER TYPE ... ADD VALUE for enums
ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'support_admin';
ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'platform_manager';
ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. Add bio field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Add product status 'paused' to product_status_enum
ALTER TYPE product_status_enum ADD VALUE IF NOT EXISTS 'paused';

-- 4. Create admin_actions log table for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'product', 'order', etc.
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- 5. Create system_settings table for platform-level config
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
