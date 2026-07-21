import { useState, useCallback, useEffect } from 'react';
import { Category } from '../../domain';
import { ListCategoriesUseCase } from '../../application';

export function useCategories(
  listCategoriesUseCase: ListCategoriesUseCase,
  includeArchived: boolean = false
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listCategoriesUseCase.execute({ includeArchived });
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [listCategoriesUseCase, includeArchived]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
  };
}
