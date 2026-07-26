-- Migration: 20260725200000_update_categories_archived_at_and_indexes
-- Description: Adds archived_at TIMESTAMPTZ, presentation columns color_hex & icon_name, and creates partial unique index for active categories per user and type.

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS color_hex TEXT NULL,
    ADD COLUMN IF NOT EXISTS icon_name TEXT NULL;

-- Backfill archived_at from is_archived if is_archived was true
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'is_archived'
    ) THEN
        UPDATE public.categories SET archived_at = NOW() WHERE is_archived = true AND archived_at IS NULL;
    END IF;
END $$;

-- Drop legacy is_archived column if present
ALTER TABLE public.categories DROP COLUMN IF EXISTS is_archived;

-- Drop old unique constraints if any
DROP INDEX IF EXISTS public.idx_categories_user_name_type_active;

-- Create partial unique index enforcing scoped uniqueness for active categories per user and category type (Income vs Expense)
CREATE UNIQUE INDEX idx_categories_user_name_type_active 
ON public.categories (user_id, lower(name), type) 
WHERE archived_at IS NULL;
