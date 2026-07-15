import { useState } from 'react';
import { budgetsModule } from './module';
import { DeleteBudgetRequest } from '../../application/use-cases';

export function useDeleteBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudget = async (request: DeleteBudgetRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await budgetsModule.deleteBudgetUseCase.execute(request);
      if (result.success) {
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteBudget,
    isLoading,
    error,
  };
}
