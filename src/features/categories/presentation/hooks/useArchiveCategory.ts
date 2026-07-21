import { useState, useCallback } from 'react';
import { ArchiveCategoryUseCase, ArchiveCategoryRequest } from '../../application';

export function useArchiveCategory(archiveCategoryUseCase: ArchiveCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveCategory = useCallback(
    async (request: ArchiveCategoryRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await archiveCategoryUseCase.execute(request);

        if (result.success) {
          return true;
        } else {
          setError(result.error.message);
          return false;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to archive category');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [archiveCategoryUseCase]
  );

  return {
    archiveCategory,
    isLoading,
    error,
  };
}
