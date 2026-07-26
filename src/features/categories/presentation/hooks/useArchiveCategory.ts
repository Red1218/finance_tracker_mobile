import { useState, useCallback } from 'react';
import { ArchiveCategoryUseCase, ArchiveCategoryCommand } from '../../application';

export function useArchiveCategory(archiveCategoryUseCase: ArchiveCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveCategory = useCallback(
    async (command: ArchiveCategoryCommand) => {
      setIsLoading(true);
      setError(null);

      try {
        await archiveCategoryUseCase.execute(command);
        return true;
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
