import { useState, useEffect, useCallback } from 'react';
import { ListBudgetsUseCase, ListBudgetsQuery } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { BudgetViewModel } from '../models/BudgetViewModel';

export function useBudgets(listBudgetsUseCase: ListBudgetsUseCase, queryFilter?: ListBudgetsQuery) {
  const [budgets, setBudgets] = useState<BudgetViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBudgetsUseCase.execute(queryFilter);
      setBudgets(data.map((b) => BudgetViewModelMapper.toViewModel(b)));
    } catch (e: any) {
      setError(e.message || 'Failed to load budgets.');
    } finally {
      setIsLoading(false);
    }
  }, [listBudgetsUseCase, queryFilter]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    isLoading,
    error,
    refresh: fetchBudgets,
  };
}
