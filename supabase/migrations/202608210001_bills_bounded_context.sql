-- Migration: 202608210001_bills_bounded_context.sql
-- Description: Creates bills and bill_payments tables, RLS policies, indexes, and atomic payment function.
-- Context: Finance Tracker Bills Bounded Context (ADR-022)

BEGIN;

-- 1. Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'INR',
    recurrence_kind TEXT NOT NULL, -- 'NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
    anchor_day_of_month INTEGER NOT NULL DEFAULT 1,
    next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_bills_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_bills_currency_code_length CHECK (length(currency_code) = 3),
    CONSTRAINT chk_bills_anchor_day CHECK (anchor_day_of_month >= 1 AND anchor_day_of_month <= 31)
);

-- 2. Bill Payments Table
CREATE TABLE IF NOT EXISTS public.bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    occurrence_key TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'INR',
    linked_transaction_id UUID NULL REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bill_payment_occurrence UNIQUE (bill_id, occurrence_key),
    CONSTRAINT chk_bill_payments_amount_positive CHECK (amount > 0)
);

-- Partial Unique Index for Linked Transaction (allows multiple NULLs, enforces uniqueness when non-null)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bill_payment_transaction
ON public.bill_payments (linked_transaction_id)
WHERE linked_transaction_id IS NOT NULL;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bills_user_upcoming
ON public.bills(user_id, next_due_date)
WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bill_payments_bill
ON public.bill_payments(bill_id, paid_at);

-- 4. Row Level Security & Policies
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bills_owner_policy ON public.bills;
CREATE POLICY bills_owner_policy
    ON public.bills FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bill_payments_owner_policy ON public.bill_payments;
CREATE POLICY bill_payments_owner_policy
    ON public.bill_payments FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. Atomic Bill Payment RPC Function (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.save_bill_payment_atomic(
    p_payment_id             UUID,
    p_bill_id                UUID,
    p_user_id                UUID,
    p_occurrence_key         TEXT,
    p_paid_at                TIMESTAMPTZ,
    p_payment_amount         NUMERIC(19,4),
    p_payment_currency       TEXT,
    p_linked_transaction_id  UUID,
    p_bill_next_due_date     TIMESTAMPTZ,
    p_bill_updated_at        TIMESTAMPTZ,
    p_bill_archived_at       TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.bill_payments (
        id,
        bill_id,
        user_id,
        occurrence_key,
        paid_at,
        amount,
        currency_code,
        linked_transaction_id,
        created_at
    ) VALUES (
        p_payment_id,
        p_bill_id,
        p_user_id,
        p_occurrence_key,
        p_paid_at,
        p_payment_amount,
        p_payment_currency,
        p_linked_transaction_id,
        NOW()
    );

    UPDATE public.bills
    SET
        next_due_date = p_bill_next_due_date,
        updated_at    = p_bill_updated_at,
        archived_at   = p_bill_archived_at
    WHERE
        id          = p_bill_id
        AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bill % not found or not owned by the current user', p_bill_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_bill_payment_atomic TO authenticated;
REVOKE EXECUTE ON FUNCTION public.save_bill_payment_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_bill_payment_atomic FROM anon;

COMMIT;
