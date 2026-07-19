-- filename: supabase/tests/categories_rls_tests.sql
-- Description: Integration tests validating the exact behavior of categories RLS policies.

BEGIN;

DO $$
DECLARE
    v_user_1 UUID := gen_random_uuid();
    v_user_2 UUID := gen_random_uuid();
    v_cat_1 UUID;
    v_cat_system UUID;
    v_row_count INT;
BEGIN
    RAISE NOTICE 'Starting Categories RLS Test Suite...';

    -- Bypass RLS briefly to seed test data (simulating service_role / system actions)
    SET LOCAL row_security = off;

    INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
    VALUES (v_user_1, 'User1 Food', 'u1-food', 'expense', 1, false, false) RETURNING id INTO v_cat_1;

    INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
    VALUES (NULL, 'System Food', 'sys-food', 'expense', 1, true, false) RETURNING id INTO v_cat_system;

    INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
    VALUES (v_user_2, 'User2 Rent', 'u2-rent', 'expense', 1, false, false);

    -- Enable RLS for tests
    SET LOCAL row_security = on;
    -- Impersonate authenticated user via Supabase claim format
    PERFORM set_config('role', 'authenticated', true);

    -------------------------------------------------------------------------
    -- TEST BLOCK 1: SELECT
    -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claims', format('{"sub": "%s"}', v_user_1), true);

    -- Owner succeeds reading their own
    SELECT count(*) INTO v_row_count FROM public.categories WHERE user_id = v_user_1;
    IF v_row_count <> 1 THEN RAISE EXCEPTION 'SELECT failed: Owner cannot read their own category'; END IF;

    -- Owner succeeds reading system categories
    SELECT count(*) INTO v_row_count FROM public.categories WHERE is_system = true;
    IF v_row_count <> 1 THEN RAISE EXCEPTION 'SELECT failed: User cannot read system categories'; END IF;

    -- Other user fails (User 1 reading User 2)
    SELECT count(*) INTO v_row_count FROM public.categories WHERE user_id = v_user_2;
    IF v_row_count <> 0 THEN RAISE EXCEPTION 'SELECT failed: User can read another user''s categories'; END IF;
    RAISE NOTICE '✓ SELECT policies validated';

    -------------------------------------------------------------------------
    -- TEST BLOCK 2: INSERT
    -------------------------------------------------------------------------
    -- Owner succeeds
    INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
    VALUES (v_user_1, 'User1 Gas', 'u1-gas', 'expense', 2, false, false);
    
    -- Wrong user fails
    BEGIN
        INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
        VALUES (v_user_2, 'User1 Hack', 'u1-hack', 'expense', 3, false, false);
        RAISE EXCEPTION 'INSERT failed: Allowed user to insert row for another user';
    EXCEPTION WHEN check_violation THEN
        -- Expected
    END;

    -- System category fails
    BEGIN
        INSERT INTO public.categories (user_id, name, slug, type, display_order, is_system, is_archived)
        VALUES (v_user_1, 'User1 Sys', 'u1-sys', 'expense', 4, true, false);
        RAISE EXCEPTION 'INSERT failed: Allowed user to insert system category';
    EXCEPTION WHEN check_violation THEN
        -- Expected
    END;
    RAISE NOTICE '✓ INSERT policies validated';

    -------------------------------------------------------------------------
    -- TEST BLOCK 3: UPDATE
    -------------------------------------------------------------------------
    -- Owner succeeds updating their own row
    UPDATE public.categories SET name = 'User1 Food Updated' WHERE id = v_cat_1;
    
    -- Ownership transfer fails
    BEGIN
        UPDATE public.categories SET user_id = v_user_2 WHERE id = v_cat_1;
        RAISE EXCEPTION 'UPDATE failed: Allowed ownership transfer';
    EXCEPTION WHEN check_violation THEN
        -- Expected
    END;

    -- System category escalation fails (Vertical Privilege Escalation test)
    BEGIN
        UPDATE public.categories SET is_system = true WHERE id = v_cat_1;
        RAISE EXCEPTION 'UPDATE failed: Allowed elevating to system category';
    EXCEPTION WHEN check_violation THEN
        -- Expected
    END;

    -- System category update fails (0 rows affected due to USING clause)
    UPDATE public.categories SET name = 'Hacked System' WHERE id = v_cat_system;
    SELECT count(*) INTO v_row_count FROM public.categories WHERE name = 'Hacked System';
    IF v_row_count > 0 THEN RAISE EXCEPTION 'UPDATE failed: Allowed updating system category'; END IF;

    -- Archive succeeds
    UPDATE public.categories SET is_archived = true WHERE id = v_cat_1;
    SELECT is_archived INTO v_row_count FROM public.categories WHERE id = v_cat_1;
    IF v_row_count = 0 THEN RAISE EXCEPTION 'UPDATE failed: Could not archive category'; END IF;

    -- Unarchive succeeds
    UPDATE public.categories SET is_archived = false WHERE id = v_cat_1;
    RAISE NOTICE '✓ UPDATE policies validated';

    -------------------------------------------------------------------------
    -- TEST BLOCK 4: DELETE
    -------------------------------------------------------------------------
    -- Verify deletion is denied (No rows deleted)
    DELETE FROM public.categories WHERE id = v_cat_1;
    SELECT count(*) INTO v_row_count FROM public.categories WHERE id = v_cat_1;
    IF v_row_count = 0 THEN RAISE EXCEPTION 'DELETE failed: Delete policy allowed row removal'; END IF;
    RAISE NOTICE '✓ DELETE policy absence validated (Archive-Only enforced)';

    RAISE NOTICE 'Test Suite Complete: PASS';
END $$;

ROLLBACK;
