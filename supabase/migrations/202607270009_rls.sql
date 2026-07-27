-- Migration: 202607270009_rls.sql
-- Description: Enables and forces Row Level Security (RLS) on all domain tables and configures tenant isolation policies.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

-- 1. Accounts RLS & Policies
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accounts_owner_policy ON public.accounts;
CREATE POLICY accounts_owner_policy
    ON public.accounts FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2. Categories RLS & Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_read_policy ON public.categories;
CREATE POLICY categories_read_policy
    ON public.categories FOR SELECT
    USING (user_id = auth.uid() OR (is_system = true AND user_id IS NULL));

DROP POLICY IF EXISTS categories_write_policy ON public.categories;
CREATE POLICY categories_write_policy
    ON public.categories FOR ALL
    USING (user_id = auth.uid() AND is_system = false)
    WITH CHECK (user_id = auth.uid() AND is_system = false);

-- 3. Transactions RLS & Policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS transactions_owner_policy ON public.transactions;
CREATE POLICY transactions_owner_policy
    ON public.transactions FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4. Budgets RLS & Policies
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS budgets_owner_policy ON public.budgets;
CREATE POLICY budgets_owner_policy
    ON public.budgets FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. Preferences RLS & Policies
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS preferences_owner_policy ON public.preferences;
CREATE POLICY preferences_owner_policy
    ON public.preferences FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

COMMIT;
