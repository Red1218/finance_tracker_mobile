-- Migration: 202607270004_categories.sql
-- Description: Creates categories table for Categories bounded context.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind public.category_kind NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    icon_name TEXT NULL,
    color_hex TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_categories_name_nonempty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_categories_color_hex_format CHECK (color_hex IS NULL OR color_hex ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_categories_system_user_integrity CHECK ((is_system = true AND user_id IS NULL) OR (is_system = false AND user_id IS NOT NULL))
);

CREATE TRIGGER trg_categories_set_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.categories IS 'Aggregate: Category — Stores income and expense transaction categories (user-defined and system default).';

COMMIT;
