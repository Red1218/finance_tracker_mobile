import { useState } from 'react';
import { budgetsModule } from './module';
import { UpdateBudgetRequest } from '../../application/use-cases';

export function useUpdateBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = async (request: UpdateBudgetRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await budgetsModule.updateBudgetUseCase.execute(request);
      if (result.success) {
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateBudget,
    isLoading,
    error,
  };
}
