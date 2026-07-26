import { useState, useCallback } from 'react';
import { RestoreCategoryUseCase, RestoreCategoryCommand } from '../../application';

export function useRestoreCategory(restoreCategoryUseCase: RestoreCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreCategory = useCallback(
    async (command: RestoreCategoryCommand) => {
      setIsLoading(true);
      setError(null);

      try {
        await restoreCategoryUseCase.execute(command);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to restore category');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [restoreCategoryUseCase]
  );

  return {
    restoreCategory,
    isLoading,
    error,
  };
}
