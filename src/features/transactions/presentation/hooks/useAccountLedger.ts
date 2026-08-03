import { useState, useCallback, useEffect } from 'react';
import { TransactionController } from '../controllers/TransactionController';
import { LedgerProjectionDTO } from '../../application/queries/LoadAccountLedgerQueryUseCase';

export function useAccountLedger(controller: TransactionController, accountId: string) {
  const [summary, setSummary] = useState<LedgerProjectionDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await controller.loadAccountLedgerSummary(accountId);
      setSummary(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [controller, accountId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
}
