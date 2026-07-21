import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { expensesModule } from './module';
import { CreateExpenseRequest } from '../../application/use-cases';
import { budgetKeys } from '../../../budgets/presentation/hooks/queryKeys';

export function useCreateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createExpense = async (request: CreateExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.createExpenseUseCase.execute(request);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: budgetKeys.summaries() });
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create expense');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createExpense,
    isLoading,
    error,
  };
}
