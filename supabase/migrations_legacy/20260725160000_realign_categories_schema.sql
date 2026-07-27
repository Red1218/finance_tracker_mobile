-- Migration: 20260725160000_realign_categories_schema
-- Description: Aligns categories table with the approved Domain model by dropping obsolete presentation metadata columns.

ALTER TABLE public.categories
    DROP COLUMN IF EXISTS icon,
    DROP COLUMN IF EXISTS color,
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS display_order;

COMMENT ON TABLE public.categories IS 'User-defined and system transaction categories (Income / Expense).';
