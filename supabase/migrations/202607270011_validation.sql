-- Migration: 202607270011_validation.sql
-- Description: Comprehensive architectural validation and compliance check script.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

DO $$
DECLARE
    v_missing_enums TEXT[];
    v_missing_tables TEXT[];
    v_forbidden_tables TEXT[];
    v_forbidden_columns TEXT[];
    v_missing_triggers TEXT[];
    v_missing_fks TEXT[];
    v_unsecured_tables TEXT[];
    v_seed_count INTEGER;
BEGIN
    -- 1. Validate Extensions
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'Architectural Violation: Extension pgcrypto is missing.';
    END IF;

    -- 2. Validate Custom Domain Enum Types
    SELECT ARRAY_AGG(e.enum_name) INTO v_missing_enums
    FROM (VALUES 
        ('account_type'), ('category_kind'), ('transaction_type'), 
        ('budget_period'), ('theme_type'), ('week_start_day')
    ) AS e(enum_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = e.enum_name
    );

    IF v_missing_enums IS NOT NULL AND array_length(v_missing_enums, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: Domain enum type(s) missing: %', array_to_string(v_missing_enums, ', ');
    END IF;

    -- 3. Validate Required Tables Existence
    SELECT ARRAY_AGG(t.table_name) INTO v_missing_tables
    FROM (VALUES ('accounts'), ('categories'), ('transactions'), ('budgets'), ('preferences')) AS t(table_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = t.table_name
    );

    IF v_missing_tables IS NOT NULL AND array_length(v_missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: Required table(s) missing: %', array_to_string(v_missing_tables, ', ');
    END IF;

    -- 4. Validate Forbidden Tables (e.g., expenses table must NOT exist)
    SELECT ARRAY_AGG(table_name) INTO v_forbidden_tables
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('expenses');

    IF v_forbidden_tables IS NOT NULL AND array_length(v_forbidden_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: Forbidden table(s) present: %', array_to_string(v_forbidden_tables, ', ');
    END IF;

    -- 5. Validate Forbidden Columns (deleted_at, is_archived, voided_at must NOT exist)
    SELECT ARRAY_AGG(table_name || '.' || column_name) INTO v_forbidden_columns
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'categories', 'transactions', 'budgets', 'preferences')
      AND column_name IN ('deleted_at', 'is_archived', 'voided_at');

    IF v_forbidden_columns IS NOT NULL AND array_length(v_forbidden_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: Forbidden column(s) present: %', array_to_string(v_forbidden_columns, ', ');
    END IF;

    -- 6. Validate Shared Trigger Function
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON n.oid = p.pronamespace 
        WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
    ) THEN
        RAISE EXCEPTION 'Architectural Violation: Shared trigger function update_updated_at_column is missing.';
    END IF;

    -- 7. Validate Table updated_at Triggers
    SELECT ARRAY_AGG(t.table_name) INTO v_missing_triggers
    FROM (VALUES ('accounts'), ('categories'), ('transactions'), ('budgets'), ('preferences')) AS t(table_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_schema = 'public' AND event_object_table = t.table_name AND action_statement LIKE '%update_updated_at_column%'
    );

    IF v_missing_triggers IS NOT NULL AND array_length(v_missing_triggers, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: updated_at trigger missing on table(s): %', array_to_string(v_missing_triggers, ', ');
    END IF;

    -- 8. Validate Foreign Key Constraints
    SELECT ARRAY_AGG(t.table_name) INTO v_missing_fks
    FROM (VALUES ('accounts'), ('categories'), ('transactions'), ('budgets'), ('preferences')) AS t(table_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' AND table_name = t.table_name AND constraint_type = 'FOREIGN KEY'
    );

    IF v_missing_fks IS NOT NULL AND array_length(v_missing_fks, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: Foreign key constraints missing on table(s): %', array_to_string(v_missing_fks, ', ');
    END IF;

    -- 9. Validate Row Level Security (RLS) and FORCE RLS Enabled on All Tables
    SELECT ARRAY_AGG(c.relname) INTO v_unsecured_tables
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('accounts', 'categories', 'transactions', 'budgets', 'preferences')
      AND (c.relrowsecurity = false OR c.relforcerowsecurity = false);

    IF v_unsecured_tables IS NOT NULL AND array_length(v_unsecured_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Architectural Violation: RLS or FORCE RLS disabled on table(s): %', array_to_string(v_unsecured_tables, ', ');
    END IF;

    -- 10. Validate Seed System Categories Count
    SELECT COUNT(*) INTO v_seed_count
    FROM public.categories
    WHERE is_system = true AND user_id IS NULL;

    IF v_seed_count < 20 THEN
        RAISE EXCEPTION 'Architectural Violation: Expected at least 20 system seed categories, found %', v_seed_count;
    END IF;

    RAISE NOTICE 'Persistence Architecture Validation Passed Successfully: All architectural assertions verified.';
END $$;

COMMIT;
