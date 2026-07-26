-- Rollback migration for 20260725210000_update_budgets_archived_at.sql

DROP INDEX IF EXISTS public.idx_budgets_user_category_active;

ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

UPDATE public.budgets
SET is_archived = true
WHERE archived_at IS NOT NULL;

ALTER TABLE public.budgets DROP COLUMN IF EXISTS archived_at;
