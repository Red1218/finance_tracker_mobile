import { useState } from 'react';
import { expensesModule } from './module';
import { UpdateExpenseRequest } from '../../application/use-cases';

export function useUpdateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = async (request: UpdateExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.updateExpenseUseCase.execute(request);
      if (result.success) {
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
