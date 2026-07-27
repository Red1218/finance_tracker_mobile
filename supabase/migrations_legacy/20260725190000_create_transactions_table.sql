-- Migration: Create transactions table for Transactions Bounded Context
-- Created: 2026-07-25 19:00:00

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME', 'TRANSFER_OUT', 'TRANSFER_IN')),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    currency_code TEXT NOT NULL DEFAULT 'INR',
    description TEXT NULL,
    transfer_group_id UUID NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voided_at TIMESTAMPTZ NULL
);

-- Index for ordering user transactions per account by date
CREATE INDEX IF NOT EXISTS idx_transactions_user_account_date
    ON public.transactions(user_id, account_id, transaction_date DESC);

-- Index for fast lookup of paired transfer group entries
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_group
    ON public.transactions(user_id, transfer_group_id)
    WHERE transfer_group_id IS NOT NULL;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_transactions_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can select their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own transactions
CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);
