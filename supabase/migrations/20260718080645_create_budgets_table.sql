-- ============================================================================
-- Migration: create_budgets_table
--
-- Purpose:
--   Creates the budgets table for storing user spending limits.
--
-- Required Before:
--   - Row Level Security
--   - Budget APIs
--
-- Depends On:
--   - enable_extensions
--   - create_categories_table
--   - create_budget_period_enum
--
-- Finance Tracker v2
-- ============================================================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    category_id UUID,

    amount NUMERIC(12,2) NOT NULL,

    period budget_period_enum NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_budgets_amount_positive
        CHECK (amount > 0),

    CONSTRAINT chk_budgets_date_range
        CHECK (end_date >= start_date)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_budgets_user_id
ON budgets(user_id);

CREATE INDEX idx_budgets_category_id
ON budgets(category_id);

CREATE INDEX idx_budgets_start_date
ON budgets(start_date);

CREATE INDEX idx_budgets_deleted_at
ON budgets(deleted_at);

-- Optimized for the most common application query:
-- WHERE user_id = ?
--   AND is_active = TRUE
--   AND deleted_at IS NULL
CREATE INDEX idx_budgets_user_active
ON budgets(user_id, is_active)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_budgets_user_category_period_start
ON budgets (
    user_id,
    category_id,
    period,
    start_date
)
WHERE category_id IS NOT NULL
  AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_budgets_user_period_start
ON budgets (
    user_id,
    period,
    start_date
)
WHERE category_id IS NULL
  AND deleted_at IS NULL;

-- ============================================================================
-- Trigger
-- ============================================================================

CREATE TRIGGER trg_budgets_set_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Documentation
-- ============================================================================

COMMENT ON TABLE budgets IS
'Stores planned spending limits for users. Budgets may apply to a specific category or represent an overall spending limit.';

COMMENT ON COLUMN budgets.id IS
'Unique identifier for the budget.';

COMMENT ON COLUMN budgets.user_id IS
'Owner of the budget.';

COMMENT ON COLUMN budgets.category_id IS
'Associated category. NULL indicates an overall budget.';

COMMENT ON COLUMN budgets.amount IS
'Maximum amount allocated for the budget period.';

COMMENT ON COLUMN budgets.period IS
'Budget frequency using budget_period_enum.';

COMMENT ON COLUMN budgets.start_date IS
'Inclusive start date of the budget period.';

COMMENT ON COLUMN budgets.end_date IS
'Inclusive end date of the budget period.';

COMMENT ON COLUMN budgets.is_active IS
'Indicates whether the budget is currently active.';

COMMENT ON COLUMN budgets.created_at IS
'Timestamp when the budget was created.';

COMMENT ON COLUMN budgets.updated_at IS
'Timestamp when the budget was last updated.';

COMMENT ON COLUMN budgets.deleted_at IS
'Soft deletion timestamp. NULL indicates an active record.';