import { useState, useCallback } from 'react';
import { CreateCategoryUseCase, CreateCategoryCommand } from '../../application';

export function useCreateCategory(createCategoryUseCase: CreateCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(
    async (command: CreateCategoryCommand) => {
      setIsLoading(true);
      setError(null);

      try {
        await createCategoryUseCase.execute(command);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create category');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [createCategoryUseCase]
  );

  return {
    createCategory,
    isLoading,
    error,
  };
}
