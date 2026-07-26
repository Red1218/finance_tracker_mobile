import { useState, useCallback, useEffect } from 'react';
import { TransactionViewModel } from '../models/TransactionViewModel';
import { TransactionController } from '../controllers/TransactionController';
import { TransactionTypeKind } from '../../domain';

export function useTransactions(
  controller: TransactionController,
  accountId: string,
  options?: {
    type?: TransactionTypeKind;
    categoryId?: string | null;
    startDate?: Date;
    endDate?: Date;
    includeVoided?: boolean;
  }
) {
  const [transactions, setTransactions] = useState<TransactionViewModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await controller.loadTransactionsViewModel({
        accountId,
        type: options?.type,
        categoryId: options?.categoryId,
        startDate: options?.startDate,
        endDate: options?.endDate,
        includeVoided: options?.includeVoided,
      });
      setTransactions(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [controller, accountId, options?.type, options?.categoryId, options?.startDate, options?.endDate, options?.includeVoided]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions,
  };
}
