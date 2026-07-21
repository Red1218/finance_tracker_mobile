import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { expensesModule } from './module';
import { RestoreExpenseRequest } from '../../application/use-cases';
import { budgetKeys } from '../../../budgets/presentation/hooks/queryKeys';

export function useRestoreExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const restoreExpense = async (request: RestoreExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.restoreExpenseUseCase.execute(request);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.summaries() });
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to restore expense');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    restoreExpense,
    isLoading,
    error,
  };
}
