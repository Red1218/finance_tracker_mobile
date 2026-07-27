-- ============================================================================
-- Migration: enable_rls_categories
--
-- Purpose:
--   Enables Row Level Security (RLS) for the categories table and creates
--   ownership-based access policies.
--
-- Depends On:
--   - create_categories_table
--
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;

CREATE POLICY select_categories ON categories
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY insert_categories ON categories
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY update_categories ON categories
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY delete_categories ON categories
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
-- WHERE tablename = 'categories'
-- ORDER BY policyname;
--
-- SELECT
--     relrowsecurity,
--     relforcerowsecurity
-- FROM pg_class
-- WHERE relname = 'categories';
--
-- Expected:
-- relrowsecurity = true
-- relforcerowsecurity = true
