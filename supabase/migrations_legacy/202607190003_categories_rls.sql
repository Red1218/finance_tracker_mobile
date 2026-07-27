-- Migration: 202607190003_categories_rls
-- Description: Implements the approved Row Level Security (RLS) architecture for categories.
-- Architecture: Single-tenant ownership (user_id = auth.uid()) OR global system read-only (user_id IS NULL AND is_system = true).
-- Lifecycle: Archive only. NO DELETE POLICY.

-- 1. Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to ensure idempotency
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories; -- Old OR policy
DROP POLICY IF EXISTS "categories_select_owner_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_select_system_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories; -- In case a rogue policy exists

-- 3. Create SELECT Policies
-- Note: Split into two distinct policies to avoid 'OR' clause query planner obfuscation,
-- maximizing the likelihood of optimal Index Scans.

-- 3a. Owner SELECT Policy
CREATE POLICY "categories_select_owner_policy"
ON public.categories
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

COMMENT ON POLICY "categories_select_owner_policy" ON public.categories IS 'Users can read their own categories.';

-- 3b. System SELECT Policy
CREATE POLICY "categories_select_system_policy"
ON public.categories
FOR SELECT
TO authenticated
USING (user_id IS NULL AND is_system = true);

COMMENT ON POLICY "categories_select_system_policy" ON public.categories IS 'Users can read global system categories.';

-- 4. Create INSERT Policy
-- Allows users to create personal categories. Prevents creating system categories or spoofing ownership.
CREATE POLICY "categories_insert_policy"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    is_system = false
);

COMMENT ON POLICY "categories_insert_policy" ON public.categories IS 'Users can only insert categories for themselves. System category creation is forbidden.';

-- 5. Create UPDATE Policy
-- Allows users to modify (or archive) their own categories.
-- USING clause: Prevents them from updating system categories (since user_id is NULL for those).
-- WITH CHECK clause: Prevents ownership transfer and prevents elevating personal categories to system categories.
CREATE POLICY "categories_update_policy"
ON public.categories
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid() AND
    is_system = false
);

COMMENT ON POLICY "categories_update_policy" ON public.categories IS 'Users can update their own categories. Cannot transfer ownership or alter system status.';

-- Note: NO DELETE POLICY IS CREATED.
-- Financial application standards enforce Archive-Only for categories to preserve ledger integrity.
