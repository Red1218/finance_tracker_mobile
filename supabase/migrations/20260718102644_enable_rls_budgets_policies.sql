-- ============================================================================
-- Migration: enable_rls_budgets_policies
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

-- ============================================================================
-- NOTE
--
-- This migration introduced the initial Budgets RLS policies.
-- A follow-up migration corrected the implementation:
--
-- 20260718102907_fix_rls_budgets.sql
-- ============================================================================