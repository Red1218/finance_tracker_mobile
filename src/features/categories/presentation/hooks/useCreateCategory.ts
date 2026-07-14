import { useState, useCallback } from 'react';
import { CreateCategoryUseCase, CreateCategoryRequest } from '../../application';

export function useCreateCategory(createCategoryUseCase: CreateCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(
    async (request: CreateCategoryRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createCategoryUseCase.execute(request);
        
        if (result.success) {
          return true;
        } else {
          setError(result.error.message);
          return false;
        }
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
