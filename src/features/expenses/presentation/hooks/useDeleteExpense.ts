import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { expensesModule } from './module';
import { DeleteExpenseRequest } from '../../application/use-cases';
import { budgetKeys } from '../../../budgets/presentation/hooks/queryKeys';

export function useDeleteExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteExpense = async (request: DeleteExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.deleteExpenseUseCase.execute(request);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.summaries() });
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete expense');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteExpense,
    isLoading,
    error,
  };
}
