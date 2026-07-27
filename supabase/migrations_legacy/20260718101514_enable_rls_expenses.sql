-- ============================================================================
-- Migration: enable_rls_expenses
--
-- Purpose:
--   Enables Row Level Security (RLS) for the expenses table and creates
--   ownership-based access policies.
--
-- Depends On:
--   - create_expenses_table
--
-- ============================================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses FORCE ROW LEVEL SECURITY;

CREATE POLICY select_expenses
ON expenses
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY insert_expenses
ON expenses
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY update_expenses
ON expenses
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY delete_expenses
ON expenses
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
-- WHERE tablename = 'expenses'
-- ORDER BY policyname;

-- SELECT
--     relrowsecurity,
--     relforcerowsecurity
-- FROM pg_class
-- WHERE relname = 'expenses';

-- Expected:
-- relrowsecurity = true
-- relforcerowsecurity = true