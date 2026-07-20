-- filename: supabase/rollback/202607190003_categories_rls.rollback.sql
-- Description: Rolls back the categories Row Level Security configuration.

-- 1. Drop the RLS policies safely
DROP POLICY IF EXISTS "categories_select_owner_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_select_system_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;

-- Note: The comments applied via COMMENT ON POLICY are automatically dropped
-- when the policy itself is dropped, so manual comment removal is not necessary.

-- 2. Disable Row Level Security on the table ONLY IF no other policies exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories'
    ) THEN
        ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;
