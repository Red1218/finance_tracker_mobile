import { useState } from 'react';
import { RestoreBudgetUseCase, RestoreBudgetCommand } from '../../application';

export function useRestoreBudget(restoreBudgetUseCase: RestoreBudgetUseCase) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const restoreBudget = async (command: RestoreBudgetCommand): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await restoreBudgetUseCase.execute(command);
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to restore budget.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    restoreBudget,
    isLoading,
    error,
  };
}
