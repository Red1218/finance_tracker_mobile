-- Migration: 202607270003_accounts.sql
-- Description: Creates accounts table for Accounts bounded context.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.account_type NOT NULL,
    currency_code TEXT NOT NULL,
    opening_balance NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_accounts_name_nonempty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_accounts_currency_code_length CHECK (length(currency_code) = 3)
);

CREATE TRIGGER trg_accounts_set_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.accounts IS 'Aggregate: Account — Stores user financial accounts (Cash, Bank, Credit Card, Wallet).';
COMMENT ON COLUMN public.accounts.currency_code IS 'ISO-4217 3-letter currency code (e.g. INR, USD, EUR). Explicitly provided by application.';

COMMIT;
