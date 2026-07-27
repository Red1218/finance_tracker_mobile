-- ============================================================================
-- Migration: fix_rls_budgets
--
-- Purpose:
--   Properly applies the RLS policies for the budgets table since the 
--   previous migration was applied empty and did not take effect.
-- ============================================================================

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets FORCE ROW LEVEL SECURITY;

CREATE POLICY select_budgets ON budgets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY insert_budgets ON budgets
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY update_budgets ON budgets
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY delete_budgets ON budgets
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
);
