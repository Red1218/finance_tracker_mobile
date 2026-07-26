-- Migration: 20260725170000_create_preferences_table
-- Description: Creates the preferences table for storing user application preferences.

CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE CONSTRAINT fk_preferences_user REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'SYSTEM',
    currency_code TEXT NOT NULL DEFAULT 'INR',
    week_start TEXT NOT NULL DEFAULT 'MONDAY',
    decimal_precision INTEGER NOT NULL DEFAULT 2,
    default_expense_category_id UUID NULL CONSTRAINT fk_preferences_default_expense_cat REFERENCES public.categories(id) ON DELETE SET NULL,
    default_income_category_id UUID NULL CONSTRAINT fk_preferences_default_income_cat REFERENCES public.categories(id) ON DELETE SET NULL,
    budget_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
    reminder_time TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preferences_select_owner_policy" ON public.preferences;
CREATE POLICY "preferences_select_owner_policy"
ON public.preferences FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_insert_owner_policy" ON public.preferences;
CREATE POLICY "preferences_insert_owner_policy"
ON public.preferences FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_update_owner_policy" ON public.preferences;
CREATE POLICY "preferences_update_owner_policy"
ON public.preferences FOR UPDATE
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE TRIGGER trg_preferences_set_updated_at
BEFORE UPDATE ON public.preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.preferences IS 'Stores application settings and preferences per user.';
