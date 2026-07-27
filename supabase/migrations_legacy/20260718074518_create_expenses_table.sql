-- ============================================================================
-- Migration: create_expenses_table
-- Purpose:
--   Creates the expenses table for storing user financial transactions.
--
-- Depends On:
--   - enable_extensions
--   - create_shared_functions
--   - create_categories_table
--   - create_payment_method_enum
--
-- Finance Tracker v2
-- ============================================================================

CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        CONSTRAINT fk_expenses_user
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    category_id UUID NOT NULL
        CONSTRAINT fk_expenses_category
        REFERENCES public.categories(id)
        ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL
        CONSTRAINT chk_expenses_amount_positive
        CHECK (amount > 0),

    currency TEXT NOT NULL DEFAULT 'INR'
        CONSTRAINT chk_expenses_currency_code
        CHECK (currency ~ '^[A-Z]{3}$'),

    payment_method payment_method_enum NOT NULL,

    merchant TEXT
        CONSTRAINT chk_expenses_merchant_not_blank
        CHECK (
            merchant IS NULL
            OR length(trim(merchant)) > 0
        ),

    note TEXT
        CONSTRAINT chk_expenses_note_not_blank
        CHECK (
            note IS NULL
            OR length(trim(note)) > 0
        ),

    expense_date DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE expenses IS
'Stores all expense transactions recorded by users.';

COMMENT ON COLUMN expenses.amount IS
'Expense amount stored using fixed-point precision.';

COMMENT ON COLUMN expenses.currency IS
'ISO 4217 currency code (e.g. INR, USD, EUR).';

COMMENT ON COLUMN expenses.payment_method IS
'Payment method used for the transaction.';

COMMENT ON COLUMN expenses.merchant IS
'Optional merchant or vendor name.';

COMMENT ON COLUMN expenses.note IS
'Optional note describing the expense.';

COMMENT ON COLUMN expenses.expense_date IS
'Business date on which the expense occurred.';

CREATE INDEX idx_expenses_user_id
ON expenses(user_id);

CREATE INDEX idx_expenses_category_id
ON expenses(category_id);

CREATE INDEX idx_expenses_expense_date
ON expenses(expense_date);

CREATE INDEX idx_expenses_user_id_expense_date
ON expenses(user_id, expense_date DESC);

CREATE INDEX idx_expenses_user_id_deleted_at
ON expenses(user_id, deleted_at);

CREATE TRIGGER trg_expenses_set_updated_at
BEFORE UPDATE
ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();