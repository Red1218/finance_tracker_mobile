import { useState, useCallback } from 'react';
import { DeleteCategoryUseCase, DeleteCategoryRequest } from '../../application';

export function useDeleteCategory(deleteCategoryUseCase: DeleteCategoryUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCategory = useCallback(
    async (request: DeleteCategoryRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await deleteCategoryUseCase.execute(request);
        
        if (result.success) {
          return true;
        } else {
          setError(result.error.message);
          return false;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete category');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteCategoryUseCase]
  );

  return {
    deleteCategory,
    isLoading,
    error,
  };
}
