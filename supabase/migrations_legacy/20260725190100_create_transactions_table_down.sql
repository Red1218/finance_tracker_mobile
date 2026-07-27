-- Migration Rollback: Create transactions table
-- Created: 2026-07-25 19:01:00

DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON public.transactions;
DROP FUNCTION IF EXISTS public.update_transactions_updated_at();

DROP INDEX IF EXISTS idx_transactions_transfer_group;
DROP INDEX IF EXISTS idx_transactions_user_account_date;

DROP TABLE IF EXISTS public.transactions CASCADE;
