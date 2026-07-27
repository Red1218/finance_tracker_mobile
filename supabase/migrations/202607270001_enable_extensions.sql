-- Migration: 202607270001_enable_extensions.sql
-- Description: Enables required PostgreSQL extensions for UUID generation and security utilities.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

-- Enable pgcrypto for cryptographic functions and gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMIT;
