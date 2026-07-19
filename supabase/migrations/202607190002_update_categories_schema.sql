-- Migration: 202607190002_update_categories_schema
-- Description: Evolves the categories schema to use an archive strategy instead of soft deletes,
--              introduces category types, and adds new fields for ordering and system categories.

-- 1. Create the category_type enum (Schema-qualified idempotency check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON n.oid = t.typnamespace 
        WHERE t.typname = 'category_type' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.category_type AS ENUM ('income', 'expense');
    END IF;
END
$$;

-- 2. Add new columns allowing NULL initially to populate existing data
ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS type public.category_type,
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 3. Populate existing rows with sensible defaults
-- NOTE: Generating slugs in the database is ONLY for migrating existing legacy data.
-- Future slug generation and conflict resolution belongs exclusively in the application's Service Layer.
UPDATE public.categories
SET 
    slug = COALESCE(
        slug, 
        NULLIF(trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), ''),
        'category-' || id::text
    ),
    type = COALESCE(type, 'expense'::public.category_type),
    display_order = COALESCE(display_order, 0),
    is_system = COALESCE(is_system, false),
    is_archived = COALESCE(is_archived, CASE WHEN deleted_at IS NOT NULL THEN true ELSE false END)
WHERE slug IS NULL 
   OR type IS NULL 
   OR display_order IS NULL 
   OR is_system IS NULL 
   OR is_archived IS NULL;

-- 4. Enforce NOT NULL constraints on the new columns now that data is populated
ALTER TABLE public.categories
    ALTER COLUMN slug SET NOT NULL,
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN display_order SET NOT NULL,
    ALTER COLUMN is_system SET NOT NULL,
    ALTER COLUMN is_archived SET NOT NULL;

-- 4b. Add defensive constraints (Idempotent metadata checks to avoid locking/churn)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        JOIN pg_namespace n ON n.relnamespace = n.oid 
        WHERE n.nspname = 'public' AND t.relname = 'categories' AND c.conname = 'chk_categories_display_order'
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT chk_categories_display_order CHECK (display_order >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        JOIN pg_namespace n ON n.relnamespace = n.oid 
        WHERE n.nspname = 'public' AND t.relname = 'categories' AND c.conname = 'chk_categories_slug_format'
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT chk_categories_slug_format CHECK (
            char_length(trim(slug)) > 0 AND 
            slug = trim(slug) AND
            slug ~ '^[a-z0-9-]+$'
        );
    END IF;
END
$$;

-- 5. Drop indexes and constraints that depend on deleted_at
DROP INDEX IF EXISTS public.idx_categories_user_id_deleted_at;
DROP INDEX IF EXISTS public.uq_categories_active_name_per_user;

-- 6. Drop the deleted_at column
ALTER TABLE public.categories
    DROP COLUMN IF EXISTS deleted_at;

-- 7. Improve Indexing Strategy
-- Drop less specific indexes if they exist
DROP INDEX IF EXISTS public.idx_categories_type;
DROP INDEX IF EXISTS public.idx_categories_is_archived;
DROP INDEX IF EXISTS public.idx_categories_display_order;
DROP INDEX IF EXISTS public.idx_categories_slug;
DROP INDEX IF EXISTS public.idx_categories_user_list;

-- Create composite index for the most common query:
-- "List all active expense/income categories for a user, ordered by display_order"
-- Order: user_id (equality), type (equality), is_archived (equality), display_order (sort)
CREATE INDEX IF NOT EXISTS idx_categories_user_list 
ON public.categories(user_id, type, is_archived, display_order);

-- Create index for slug lookups (usually scoped by user in API calls, e.g. for imports)
CREATE INDEX IF NOT EXISTS idx_categories_user_slug 
ON public.categories(user_id, slug);

-- 8. Create the new unique constraints for active categories (per user and type)
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_active_name_type_per_user 
ON public.categories(user_id, lower(name), type) 
WHERE is_archived = false;

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_active_slug_type_per_user 
ON public.categories(user_id, slug, type) 
WHERE is_archived = false;

-- 9. Trigger Review
-- The trigger trg_categories_set_updated_at was created in the initial migration.
-- No need to drop and recreate it here, as it automatically triggers on updates for all columns.

-- 10. Update Comments
COMMENT ON TABLE public.categories IS 'User-defined and system transaction categories.';
COMMENT ON COLUMN public.categories.slug IS 'URL-friendly version of the category name. Generated and validated by the Service Layer.';
COMMENT ON COLUMN public.categories.type IS 'Indicates if the category is for income or expenses.';
COMMENT ON COLUMN public.categories.display_order IS 'Order in which the category should be displayed in the UI. 0 is highest precedence.';
COMMENT ON COLUMN public.categories.is_system IS 'Flag indicating if this is a protected system category that cannot be modified by the user.';
COMMENT ON COLUMN public.categories.is_archived IS 'Archive flag. True means hidden from active selection, but preserved for historical transactions.';
COMMENT ON COLUMN public.categories.name IS 'User-defined category name. Must be unique per user and type among active categories.';
