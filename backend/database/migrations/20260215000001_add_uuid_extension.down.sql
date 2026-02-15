-- Rollback: add_uuid_extension

ALTER TABLE users DROP COLUMN IF EXISTS public_id;
DROP EXTENSION IF EXISTS "uuid-ossp"
