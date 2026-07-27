-- Migration: 202607270006_budgets.sql
-- Description: Creates budgets table for Budgets bounded context.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL,
    period_kind public.budget_period NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_budgets_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_budgets_currency_code_length CHECK (length(currency_code) = 3),
    CONSTRAINT chk_budgets_date_range CHECK (start_date < end_date)
);

CREATE TRIGGER trg_budgets_set_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.budgets IS 'Aggregate: Budget — Stores user spending targets and budgets. Scope Rule: If category_id IS NULL -> Overall Budget; If category_id IS NOT NULL -> Category Budget.';
COMMENT ON COLUMN public.budgets.currency_code IS 'ISO-4217 3-letter currency code (e.g. INR, USD, EUR). Explicitly provided by application.';

COMMIT;
