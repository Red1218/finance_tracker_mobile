-- filename: supabase/rollback/202607190002_update_categories_schema.rollback.sql
-- Description: Rolls back the categories schema to soft deletes.

-- 1. Re-add deleted_at
ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- 2. Populate deleted_at based on is_archived
UPDATE public.categories
SET deleted_at = CURRENT_TIMESTAMP
WHERE is_archived = true AND deleted_at IS NULL;

-- 3. Recreate the old partial index relying on deleted_at
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_active_name_per_user 
ON public.categories(user_id, lower(name)) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_user_id_deleted_at 
ON public.categories(user_id, deleted_at);

-- 4. Drop the new indices
DROP INDEX IF EXISTS public.idx_categories_user_list;
DROP INDEX IF EXISTS public.idx_categories_user_slug;
DROP INDEX IF EXISTS public.uq_categories_active_name_type_per_user;
DROP INDEX IF EXISTS public.uq_categories_active_slug_type_per_user;

-- 5. Drop the new constraints
ALTER TABLE public.categories
    DROP CONSTRAINT IF EXISTS chk_categories_display_order,
    DROP CONSTRAINT IF EXISTS chk_categories_slug_format;

-- 6. Drop the new columns
ALTER TABLE public.categories
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS display_order,
    DROP COLUMN IF EXISTS is_system,
    DROP COLUMN IF EXISTS is_archived;

-- 7. Drop the enum (ONLY IF no other tables depend on it)
-- To be completely safe in a shared environment, dropping types is often omitted.
-- However, for a perfect rollback of this specific migration:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON n.oid = t.typnamespace 
        WHERE t.typname = 'category_type' AND n.nspname = 'public'
    ) THEN
        DROP TYPE public.category_type;
    END IF;
END
$$;

-- 8. Restore Comments
COMMENT ON TABLE public.categories IS 'User-defined expense categories.';
COMMENT ON COLUMN public.categories.name IS 'User-defined category name. Must be unique per user among active categories.';
