import { useState, useCallback, useEffect } from 'react';
import { CategoryKind } from '../../domain';
import { ListCategoriesUseCase, CategoryDTO } from '../../application';

export function useCategories(
  listCategoriesUseCase: ListCategoriesUseCase,
  includeArchived: boolean = false,
  kind?: CategoryKind
) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await listCategoriesUseCase.execute({ includeArchived, kind });
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [listCategoriesUseCase, includeArchived, kind]);

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
