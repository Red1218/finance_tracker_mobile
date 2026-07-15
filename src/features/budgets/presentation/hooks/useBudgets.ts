import { useState, useCallback, useEffect } from 'react';
import { budgetsModule } from './module';
import { BudgetItemModel } from '../models';
import { ListBudgetsRequest } from '../../application/use-cases';

export function useBudgets(filter?: ListBudgetsRequest) {
  const [budgets, setBudgets] = useState<BudgetItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterHash = JSON.stringify(filter);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentFilter = filterHash ? JSON.parse(filterHash) : {};
      const result = await budgetsModule.listBudgetsUseCase.execute(currentFilter);
      
      if (result.success) {
        const viewModels: BudgetItemModel[] = result.data.map(b => ({
          id: b.id.value,
          categoryId: b.categoryId?.value ?? null,
          amount: b.amount.value,
          currency: b.currency.value,
          formattedAmount: `${b.currency.value} ${(b.amount.value / 100).toFixed(2)}`,
          period: b.period.value,
          status: b.status.value,
        }));

        setBudgets(viewModels);
      } else {
        setError(result.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  }, [filterHash]);

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
