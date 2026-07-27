-- Migration: 20260725180000_create_accounts_table
-- Description: Creates accounts table representing financial accounts (Cash, Bank, Credit Card, Wallet).

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID CONSTRAINT fk_accounts_user REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CASH', 'BANK', 'CREDIT_CARD', 'WALLET')),
    currency_code TEXT NOT NULL DEFAULT 'INR' CHECK (length(currency_code) = 3),
    opening_balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_account_name_nonempty CHECK (length(trim(name)) > 0)
);

-- Partial Unique Index 1: Ensures account names are unique among active accounts per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_name_active
ON public.accounts (user_id, lower(name))
WHERE archived_at IS NULL;

-- Partial Unique Index 2: Guarantees at most one default account per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_default
ON public.accounts (user_id)
WHERE is_default = true;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accounts_select_owner_policy" ON public.accounts;
CREATE POLICY "accounts_select_owner_policy"
ON public.accounts FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_insert_owner_policy" ON public.accounts;
CREATE POLICY "accounts_insert_owner_policy"
ON public.accounts FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_update_owner_policy" ON public.accounts;
CREATE POLICY "accounts_update_owner_policy"
ON public.accounts FOR UPDATE
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_delete_owner_policy" ON public.accounts;
CREATE POLICY "accounts_delete_owner_policy"
ON public.accounts FOR DELETE
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE TRIGGER trg_accounts_set_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.accounts IS 'Stores financial accounts (Cash, Bank, Credit Card, Wallet) per user.';
