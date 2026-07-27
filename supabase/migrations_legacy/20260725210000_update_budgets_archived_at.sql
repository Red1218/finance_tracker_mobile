-- Migration: Update budgets schema for archived_at lifecycle and overlap performance indexes

ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Migrate existing boolean is_archived data if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'budgets' AND column_name = 'is_archived'
  ) THEN
    UPDATE public.budgets
    SET archived_at = NOW()
    WHERE is_archived = true AND archived_at IS NULL;

    ALTER TABLE public.budgets DROP COLUMN is_archived;
  END IF;
END $$;

-- Index optimizing active budget scope and overlap queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_category_active
ON public.budgets (user_id, category_id, period_type, start_date, end_date)
WHERE archived_at IS NULL;
