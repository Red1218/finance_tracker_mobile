-- Migration: 202607270002_shared_functions.sql
-- Description: Creates domain enum types and global shared database trigger functions.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

-- 1. Create Domain Enum Types

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE public.account_type AS ENUM ('CASH', 'BANK', 'CREDIT_CARD', 'WALLET');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_kind') THEN
        CREATE TYPE public.category_kind AS ENUM ('INCOME', 'EXPENSE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_period') THEN
        CREATE TYPE public.budget_period AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_type') THEN
        CREATE TYPE public.theme_type AS ENUM ('SYSTEM', 'LIGHT', 'DARK');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'week_start_day') THEN
        CREATE TYPE public.week_start_day AS ENUM ('MONDAY', 'SUNDAY');
    END IF;
END $$;

-- 2. Create Shared Trigger Function for updated_at Column Maintenance

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
