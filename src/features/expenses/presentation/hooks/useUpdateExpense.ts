import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { expensesModule } from './module';
import { UpdateExpenseRequest } from '../../application/use-cases';
import { budgetKeys } from '../../../budgets/presentation/hooks/queryKeys';

export function useUpdateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateExpense = async (request: UpdateExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.updateExpenseUseCase.execute(request);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.summaries() });
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update expense');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateExpense,
    isLoading,
    error,
  };
}
