-- Migration: 202607270010_seed_data.sql
-- Description: Seeds immutable default system reference categories for expense and income classification.
-- Context: Finance Tracker Persistence Architecture (Approved & Frozen)

BEGIN;

-- Insert System Expense Categories
INSERT INTO public.categories (user_id, name, kind, is_system, icon_name, color_hex)
VALUES
    (NULL, 'Uncategorized Expense', 'EXPENSE', true, 'folder-outline', '#9E9E9E'),
    (NULL, 'Food & Dining', 'EXPENSE', true, 'fast-food-outline', '#FF5722'),
    (NULL, 'Groceries', 'EXPENSE', true, 'cart-outline', '#4CAF50'),
    (NULL, 'Transportation', 'EXPENSE', true, 'car-outline', '#2196F3'),
    (NULL, 'Fuel', 'EXPENSE', true, 'speedometer-outline', '#FF9800'),
    (NULL, 'Housing & Utilities', 'EXPENSE', true, 'home-outline', '#795548'),
    (NULL, 'Rent', 'EXPENSE', true, 'key-outline', '#8D6E63'),
    (NULL, 'Shopping', 'EXPENSE', true, 'bag-handle-outline', '#E91E63'),
    (NULL, 'Entertainment', 'EXPENSE', true, 'film-outline', '#9C27B0'),
    (NULL, 'Healthcare', 'EXPENSE', true, 'medical-outline', '#F44336'),
    (NULL, 'Insurance', 'EXPENSE', true, 'shield-checkmark-outline', '#3F51B5'),
    (NULL, 'Education', 'EXPENSE', true, 'school-outline', '#673AB7'),
    (NULL, 'Travel', 'EXPENSE', true, 'airplane-outline', '#00BCD4'),
    (NULL, 'Personal Care', 'EXPENSE', true, 'person-outline', '#EC407A'),
    (NULL, 'Taxes', 'EXPENSE', true, 'document-text-outline', '#607D8B'),
    (NULL, 'Bills & Subscriptions', 'EXPENSE', true, 'card-outline', '#455A64')
ON CONFLICT (lower(name), kind) WHERE is_system = true AND archived_at IS NULL DO NOTHING;

-- Insert System Income Categories
INSERT INTO public.categories (user_id, name, kind, is_system, icon_name, color_hex)
VALUES
    (NULL, 'Uncategorized Income', 'INCOME', true, 'wallet-outline', '#4CAF50'),
    (NULL, 'Salary & Wages', 'INCOME', true, 'cash-outline', '#2E7D32'),
    (NULL, 'Bonus', 'INCOME', true, 'trophy-outline', '#FFD700'),
    (NULL, 'Investments', 'INCOME', true, 'trending-up-outline', '#009688'),
    (NULL, 'Interest', 'INCOME', true, 'stats-chart-outline', '#00897B'),
    (NULL, 'Dividends', 'INCOME', true, 'pie-chart-outline', '#00796B'),
    (NULL, 'Freelance & Side Business', 'INCOME', true, 'briefcase-outline', '#00BCD4'),
    (NULL, 'Gifts & Grants', 'INCOME', true, 'gift-outline', '#8BC34A'),
    (NULL, 'Refunds', 'INCOME', true, 'refresh-circle-outline', '#CDDC39')
ON CONFLICT (lower(name), kind) WHERE is_system = true AND archived_at IS NULL DO NOTHING;

COMMIT;
