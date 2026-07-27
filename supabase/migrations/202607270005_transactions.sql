-- Migration: 202607270005_transactions.sql
-- Description: Creates transactions table for Transactions bounded context (Canonical Financial Ledger).
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    type public.transaction_type NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL,
    description TEXT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transfer_group_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_transactions_currency_code_length CHECK (length(currency_code) = 3),
    CONSTRAINT chk_transactions_transfer_category_null CHECK (
        (type IN ('TRANSFER_OUT', 'TRANSFER_IN') AND category_id IS NULL) OR (type NOT IN ('TRANSFER_OUT', 'TRANSFER_IN'))
    ),
    CONSTRAINT chk_transactions_transfer_group_required CHECK (
        (type IN ('TRANSFER_OUT', 'TRANSFER_IN') AND transfer_group_id IS NOT NULL) OR (type NOT IN ('TRANSFER_OUT', 'TRANSFER_IN'))
    )
);

CREATE TRIGGER trg_transactions_set_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.transactions IS 'Aggregate: Transaction — Canonical financial ledger storing all transaction entries (Expense, Income, Transfers). Application Invariant: EXPENSE transactions reference EXPENSE categories; INCOME transactions reference INCOME categories.';
COMMENT ON COLUMN public.transactions.occurred_at IS 'Timestamp when the financial event actually occurred.';
COMMENT ON COLUMN public.transactions.transfer_group_id IS 'Logical grouping UUID linking paired ledger entries (TRANSFER_OUT and TRANSFER_IN). Not a foreign key reference.';
COMMENT ON COLUMN public.transactions.currency_code IS 'ISO-4217 3-letter currency code (e.g. INR, USD, EUR). Explicitly provided by application.';

COMMIT;
