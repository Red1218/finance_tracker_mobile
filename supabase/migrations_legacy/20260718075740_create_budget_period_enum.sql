-- ============================================================================
-- Migration: create_budget_period_enum
--
-- Purpose:
--   Creates shared budget period enum.
--
-- Required Before:
--   - create_budgets_table
--
-- Depends On:
--   - enable_extensions
--
-- ============================================================================

CREATE TYPE budget_period_enum AS ENUM (
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'CUSTOM'
);

COMMENT ON TYPE budget_period_enum IS
'Supported budget periods for user-defined spending limits.';