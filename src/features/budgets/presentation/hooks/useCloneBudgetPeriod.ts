import { useState } from 'react';
import { CloneBudgetPeriodUseCase, CloneBudgetPeriodCommand } from '../../application/use-cases/CloneBudgetPeriodUseCase';

export function useCloneBudgetPeriod(cloneUseCase: CloneBudgetPeriodUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cloneBudgetPeriod = async (command: CloneBudgetPeriodCommand): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await cloneUseCase.execute(command);
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to clone budget period');
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
