-- Rollback Migration: 20260725200100_update_categories_archived_at_and_indexes_down

DROP INDEX IF EXISTS public.idx_categories_user_name_type_active;

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

UPDATE public.categories SET is_archived = true WHERE archived_at IS NOT NULL;

ALTER TABLE public.categories
    DROP COLUMN IF EXISTS archived_at,
    DROP COLUMN IF EXISTS color_hex,
    DROP COLUMN IF EXISTS icon_name;
