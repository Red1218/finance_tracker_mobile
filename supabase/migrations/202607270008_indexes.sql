-- Migration: 202607270008_indexes.sql
-- Description: Creates performance, foreign key lookup, and partial unique indexes for all domain tables.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

-- 1. Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id
    ON public.accounts (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_name_active
    ON public.accounts (user_id, lower(name))
    WHERE archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_default
    ON public.accounts (user_id)
    WHERE is_default = true AND archived_at IS NULL;

-- 2. Categories Indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON public.categories (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name_kind_active
    ON public.categories (user_id, lower(name), kind)
    WHERE user_id IS NOT NULL AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_system_name_kind
    ON public.categories (lower(name), kind)
    WHERE is_system = true AND archived_at IS NULL;

-- 3. Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON public.transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
    ON public.transactions (account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
    ON public.transactions (category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_transfer_group_id
    ON public.transactions (transfer_group_id)
    WHERE transfer_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_occurred_at
    ON public.transactions (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_occurred_at
    ON public.transactions (user_id, type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_account_occurred_at
    ON public.transactions (user_id, account_id, occurred_at DESC);

-- 4. Budgets Indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id
    ON public.budgets (user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_category_id
    ON public.budgets (category_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_category_period
    ON public.budgets (user_id, category_id, period_kind, start_date, end_date)
    WHERE archived_at IS NULL;

-- 5. Preferences Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_preferences_user_id
    ON public.preferences (user_id);

COMMIT;
