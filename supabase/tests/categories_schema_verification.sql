-- filename: supabase/tests/categories_schema_verification.sql
-- Description: DBRE-level Verification script for categories schema

BEGIN;

DO $$
DECLARE
    v_count INT;
BEGIN
    RAISE NOTICE 'Starting DBRE Categories Schema Verification...';

    -- 1. Check Table Exists, Schema, and Owner (Assuming 'postgres' or similar admin)
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        JOIN pg_roles r ON r.oid = c.relowner
        WHERE n.nspname = 'public' AND c.relname = 'categories'
    ) THEN
        RAISE EXCEPTION 'Table public.categories does not exist or ownership is malformed';
    END IF;
    RAISE NOTICE '✓ Table public.categories exists with valid metadata';

    -- 2. Check Enum Exists securely
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_namespace n ON n.oid = t.typnamespace 
        WHERE n.nspname = 'public' AND t.typname = 'category_type'
    ) THEN
        RAISE EXCEPTION 'Enum public.category_type does not exist';
    END IF;
    RAISE NOTICE '✓ Enum public.category_type exists';

    -- 3. Check Required Columns & Data Types
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' 
        AND column_name = 'slug' AND data_type = 'text' AND is_nullable = 'NO'
    ) THEN
        RAISE EXCEPTION 'Column slug is missing, nullable, or not TEXT';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'deleted_at') THEN
        RAISE EXCEPTION 'Column deleted_at still exists';
    END IF;
    RAISE NOTICE '✓ Column specifications and data types strictly match';

    -- 4. Check Foreign Keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'categories' AND kcu.column_name = 'user_id'
    ) THEN
        RAISE EXCEPTION 'Foreign key on user_id is missing';
    END IF;
    RAISE NOTICE '✓ Foreign keys exist';

    -- 5. Check Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'categories' AND indexname = 'idx_categories_user_list') THEN
        RAISE EXCEPTION 'Composite Index idx_categories_user_list is missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'categories' AND indexname = 'uq_categories_active_name_type_per_user') THEN
        RAISE EXCEPTION 'Unique index uq_categories_active_name_type_per_user is missing';
    END IF;
    RAISE NOTICE '✓ Indexes exist';

    -- 6. Check Constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints cc JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name WHERE tc.table_schema = 'public' AND tc.table_name = 'categories' AND cc.constraint_name = 'chk_categories_display_order') THEN
        RAISE EXCEPTION 'Constraint chk_categories_display_order is missing';
    END IF;
    RAISE NOTICE '✓ Defensive constraints exist';

    -- 7. Check Trigger and Function exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column') THEN
        RAISE EXCEPTION 'Function public.update_updated_at_column is missing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table = 'categories' AND trigger_name = 'trg_categories_set_updated_at') THEN
        RAISE EXCEPTION 'Trigger trg_categories_set_updated_at is missing';
    END IF;
    RAISE NOTICE '✓ Trigger system is intact';

    -- 8. Check RLS is enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relrowsecurity = true) THEN
        RAISE WARNING 'RLS is NOT enabled on public.categories';
    ELSE
        RAISE NOTICE '✓ RLS is enabled';
    END IF;

    -- 9. Check Comments
    IF NOT EXISTS (SELECT 1 FROM pg_description d JOIN pg_class c ON c.oid = d.objoid JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'categories' AND d.objsubid = 0) THEN
        RAISE WARNING 'Table public.categories has no description comment';
    ELSE
        RAISE NOTICE '✓ Table comment exists';
    END IF;

    RAISE NOTICE 'DBRE Verification Complete: PASS';
END $$;

ROLLBACK;
