import { useState, useEffect, useCallback } from 'react';
import { GetBudgetSummaryUseCase, BudgetSummary } from '../../application';

export function useBudgetSummary(getBudgetSummaryUseCase: GetBudgetSummaryUseCase, budgetId: string) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!budgetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBudgetSummaryUseCase.execute({ budgetId });
      setSummary(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load budget summary.');
    } finally {
      setIsLoading(false);
    }
  }, [getBudgetSummaryUseCase, budgetId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refresh: fetchSummary,
  };
}
