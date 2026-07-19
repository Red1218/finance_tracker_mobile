-- filename: supabase/tests/categories_rls_verification.sql
-- Description: DBRE-level verification script to assert RLS correctness on public.categories.

BEGIN;

DO $$
DECLARE
    v_missing_policies INT;
    v_rogue_policies INT;
BEGIN
    RAISE NOTICE 'Starting Categories RLS Verification...';

    -- 1. Check RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is NOT enabled on public.categories';
    END IF;
    RAISE NOTICE '✓ RLS is enabled';

    -- 2. Verify Exact Policies Exist and inspect policy text for auth.uid() binding
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'categories' 
          AND policyname = 'categories_select_owner_policy' 
          AND cmd = 'SELECT'
          AND qual LIKE '%uid()%'
    ) THEN
        RAISE EXCEPTION 'categories_select_owner_policy is missing or lacks auth.uid() binding';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'categories' 
          AND policyname = 'categories_select_system_policy' 
          AND cmd = 'SELECT'
          AND qual LIKE '%is_system%'
    ) THEN
        RAISE EXCEPTION 'categories_select_system_policy is missing or malformed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'categories' 
          AND policyname = 'categories_insert_policy' 
          AND cmd = 'INSERT'
          AND with_check LIKE '%uid()%'
    ) THEN
        RAISE EXCEPTION 'categories_insert_policy is missing or lacks auth.uid() binding';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'categories' 
          AND policyname = 'categories_update_policy' 
          AND cmd = 'UPDATE'
          AND qual LIKE '%uid()%'
          AND with_check LIKE '%uid()%'
    ) THEN
        RAISE EXCEPTION 'categories_update_policy is missing or lacks auth.uid() binding';
    END IF;
    RAISE NOTICE '✓ Required policies exist and text qual verification passed';

    -- 3. Verify NO DELETE policy exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'categories' AND cmd = 'DELETE'
    ) THEN
        RAISE EXCEPTION 'A DELETE policy exists. This violates the Archive-Only architecture.';
    END IF;
    RAISE NOTICE '✓ NO DELETE policy exists (Archive-Only architecture respected)';

    -- 4. Verify Policy Comments
    IF NOT EXISTS (
        SELECT 1 FROM pg_description d 
        JOIN pg_class c ON c.oid = d.classoid 
        JOIN pg_policy p ON p.oid = d.objoid 
        WHERE p.polname = 'categories_select_owner_policy'
    ) THEN
        RAISE EXCEPTION 'Missing COMMENT on categories_select_owner_policy';
    END IF;
    RAISE NOTICE '✓ Policy comments are present';

    -- 5. Service Role Note
    RAISE NOTICE '✓ Verification assumes the Service Role automatically bypasses these policies due to its bypassrls attribute.';

    RAISE NOTICE 'Categories RLS Verification Complete: PASS';
END $$;

ROLLBACK;
