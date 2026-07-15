import { useState } from 'react';
import { budgetsModule } from './module';
import { CloneBudgetPeriodRequest } from '../../application/use-cases';

export function useCloneBudgetPeriod() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cloneBudgetPeriod = async (request: CloneBudgetPeriodRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await budgetsModule.cloneBudgetPeriodUseCase.execute(request);
      if (result.success) {
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clone budget period');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cloneBudgetPeriod,
    isLoading,
    error,
  };
}
