-- Migration: initial_baseline
-- Created: 2026-02-15
-- This baseline migration marks the existing schema as "migrated".
-- It only creates the tracking table; the actual schema already exists from schema.sql.
-- All FUTURE schema changes must go through new migration files.

-- No-op: schema already exists. This migration is just a version marker.
SELECT 1
