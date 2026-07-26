import { useState, useCallback } from 'react';
import { RenameCategoryUseCase, RenameCategoryCommand } from '../../application';

export function useRenameCategory(renameCategoryUseCase: RenameCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameCategory = useCallback(
    async (command: RenameCategoryCommand) => {
      setIsLoading(true);
      setError(null);

      try {
        await renameCategoryUseCase.execute(command);
        return true;
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
