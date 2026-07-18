-- ============================================================================
-- Migration: enable_rls_budgets
--
-- Purpose:
--   Enables Row Level Security (RLS) for the budgets table and creates
--   ownership-based access policies.
--
-- Depends On:
--   - create_budgets_table
--
-- ============================================================================

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

ALTER TABLE budgets FORCE ROW LEVEL SECURITY;

CREATE POLICY select_budgets
ON budgets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY insert_budgets
ON budgets
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY update_budgets
ON budgets
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY delete_budgets
ON budgets
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'budgets'
-- ORDER BY policyname;

-- SELECT
--     relrowsecurity,
--     relforcerowsecurity
-- FROM pg_class
-- WHERE relname = 'budgets';

-- Expected:
-- relrowsecurity = true
-- relforcerowsecurity = true

-- ============================================================================
-- NOTE
--
-- This migration was accidentally created and applied without SQL.
-- It is intentionally retained because it exists in the migration history.
--
-- The actual RLS implementation begins in:
-- 20260718102644_enable_rls_budgets_policies.sql
-- ============================================================================