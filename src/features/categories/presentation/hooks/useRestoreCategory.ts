import { useState, useCallback } from 'react';
import { RestoreCategoryUseCase, RestoreCategoryRequest } from '../../application';

export function useRestoreCategory(restoreCategoryUseCase: RestoreCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreCategory = useCallback(
    async (request: RestoreCategoryRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await restoreCategoryUseCase.execute(request);

        if (result.success) {
          return true;
        } else {
          setError(result.error.message);
          return false;
        }
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
