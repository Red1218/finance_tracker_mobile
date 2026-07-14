import { useState, useCallback } from 'react';
import { RenameCategoryUseCase, RenameCategoryRequest } from '../../application';

export function useRenameCategory(renameCategoryUseCase: RenameCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameCategory = useCallback(
    async (request: RenameCategoryRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await renameCategoryUseCase.execute(request);
        
        if (result.success) {
          return true;
        } else {
          setError(result.error.message);
          return false;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to rename category');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [renameCategoryUseCase]
  );

  return {
    renameCategory,
    isLoading,
    error,
  };
}
