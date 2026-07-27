-- Migration: 202607270007_preferences.sql
-- Description: Creates preferences table for Preferences bounded context.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme public.theme_type NOT NULL DEFAULT 'SYSTEM',
    currency_code TEXT NOT NULL,
    week_start public.week_start_day NOT NULL DEFAULT 'MONDAY',
    decimal_precision INTEGER NOT NULL DEFAULT 2,
    default_expense_category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    default_income_category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    budget_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
    reminder_time TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_preferences_currency_code_length CHECK (length(currency_code) = 3),
    CONSTRAINT chk_preferences_decimal_precision_range CHECK (decimal_precision BETWEEN 0 AND 8),
    CONSTRAINT chk_preferences_reminder_time_format CHECK (reminder_time IS NULL OR reminder_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);

CREATE TRIGGER trg_preferences_set_updated_at
    BEFORE UPDATE ON public.preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.preferences IS 'Aggregate: Preference — Stores application settings and user runtime preferences.';
COMMENT ON COLUMN public.preferences.currency_code IS 'ISO-4217 3-letter currency code (e.g. INR, USD, EUR). Explicitly provided by application.';

COMMIT;
