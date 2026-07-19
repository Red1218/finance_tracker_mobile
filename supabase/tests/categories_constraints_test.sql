-- filename: supabase/tests/categories_constraints_test.sql
-- Description: Enterprise test suite for verifying constraints on public.categories
-- Strategy: Avoids writing to auth.users by temporarily disabling triggers (which enforces FKs) 
-- inside a transaction that is guaranteed to rollback.

BEGIN;

DO $$
DECLARE
    v_test_user UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Starting Categories Constraints Test Suite...';

    -- Disable triggers to bypass the foreign key to auth.users for this test transaction
    -- This avoids polluting or depending on external managed schemas like auth.
    ALTER TABLE public.categories DISABLE TRIGGER ALL;

    -- Test 1: Insert valid category
    INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
    VALUES (v_test_user, 'Groceries', 'shopping-cart', '#ff0000', 'groceries', 'expense', 1);
    RAISE NOTICE '✓ Valid category insert successful';

    -- Test 2: Duplicate name for active category (should fail)
    BEGIN
        INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
        VALUES (v_test_user, 'GROCERIES', 'shopping-cart', '#ff0000', 'groceries-2', 'expense', 2);
        RAISE EXCEPTION 'Failed: Allowed duplicate active category name';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ Duplicate active name prevented';
    END;

    -- Test 3: Duplicate slug for active category (should fail)
    BEGIN
        INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
        VALUES (v_test_user, 'Food', 'shopping-cart', '#ff0000', 'groceries', 'expense', 2);
        RAISE EXCEPTION 'Failed: Allowed duplicate active category slug';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ Duplicate active slug prevented';
    END;

    -- Test 4: Duplicate name for archived category (should succeed)
    INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order, is_archived)
    VALUES (v_test_user, 'Groceries', 'shopping-cart', '#ff0000', 'groceries-old', 'expense', 3, true);
    RAISE NOTICE '✓ Duplicate name allowed if archived';

    -- Test 5: Same name and slug but different type (should succeed)
    INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
    VALUES (v_test_user, 'Groceries', 'shopping-cart', '#ff0000', 'groceries', 'income', 1);
    RAISE NOTICE '✓ Same name/slug allowed for different category types';

    -- Test 6: Invalid display order (should fail)
    BEGIN
        INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
        VALUES (v_test_user, 'Rent', 'home', '#00ff00', 'rent', 'expense', -1);
        RAISE EXCEPTION 'Failed: Allowed negative display_order';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Negative display_order prevented';
    END;

    -- Test 7: Invalid slug (should fail)
    BEGIN
        INSERT INTO public.categories (user_id, name, icon, color, slug, type, display_order)
        VALUES (v_test_user, 'Utilities', 'zap', '#00ff00', 'utilities!', 'expense', 1);
        RAISE EXCEPTION 'Failed: Allowed invalid slug format';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Invalid slug format prevented';
    END;

    RAISE NOTICE 'Test Suite Complete: PASS';
END $$;

ROLLBACK;
