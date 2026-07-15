import { useState } from 'react';
import { budgetsModule } from './module';
import { CreateBudgetRequest } from '../../application/use-cases';

export function useCreateBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = async (request: CreateBudgetRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await budgetsModule.createBudgetUseCase.execute(request);
      if (result.success) {
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBudget,
    isLoading,
    error,
  };
}
