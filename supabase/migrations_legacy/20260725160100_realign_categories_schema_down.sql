-- Migration Rollback: 20260725160100_realign_categories_schema_down
-- Description: Rollback script re-adding legacy presentation columns if needed.

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'default',
    ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#000000',
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
