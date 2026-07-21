import { useState } from 'react';
import { expensesModule } from './module';
import { RestoreExpenseRequest } from '../../application/use-cases';

export function useRestoreExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreExpense = async (request: RestoreExpenseRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await expensesModule.restoreExpenseUseCase.execute(request);
      if (result.success) {
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
