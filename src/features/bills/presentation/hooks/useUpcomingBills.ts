import { useState, useEffect, useCallback } from 'react';
import { BillsPresenter } from '../presenters/BillsPresenter';
import { UpcomingBillsSectionState } from '../view-models/UpcomingBillsViewModel';

export interface UseUpcomingBillsResult {
  readonly state: UpcomingBillsSectionState;
  readonly refresh: () => Promise<void>;
  readonly handleMarkPaid: (billId: string) => Promise<void>;
}

export function useUpcomingBills(
  userId: string,
  presenter: BillsPresenter
): UseUpcomingBillsResult {
  const [state, setState] = useState<UpcomingBillsSectionState>({
    status: 'LOADING',
    bills: [],
    errorMessage: null,
  });

  const fetchBills = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'LOADING', errorMessage: null }));
    try {
      const bills = await presenter.loadUpcomingBills(userId);
      setState({
        status: 'SUCCESS',
        bills,
        errorMessage: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load upcoming bills.';
      setState({
        status: 'ERROR',
        bills: [],
        errorMessage: message,
      });
    }
  }, [userId, presenter]);

  useEffect(() => {
    if (userId) {
      void fetchBills();
    }
  }, [userId, fetchBills]);

  const handleMarkPaid = useCallback(
    async (billId: string) => {
      const targetBill = state.bills.find((b) => b.billId === billId);
      if (!targetBill) return;

      try {
        await presenter.markBillPaid({
          billId: targetBill.billId,
          amount: targetBill.rawAmount,
          currencyCode: targetBill.currencyCode,
        });

        // Reload bills after payment
        await fetchBills();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to mark bill as paid.';
        setState((prev) => ({
          ...prev,
          errorMessage: message,
        }));
      }
    },
    [state.bills, presenter, fetchBills]
  );

  return {
    state,
    refresh: fetchBills,
    handleMarkPaid,
  };
}
