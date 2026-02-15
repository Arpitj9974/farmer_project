-- Migration: add_uuid_extension
-- Enable UUID support for future use. Existing SERIAL IDs remain untouched.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add uuid columns to users table for external API references
-- (Keeps SERIAL id for internal FK references — changing PKs mid-production is extremely dangerous)
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT uuid_generate_v4() UNIQUE
