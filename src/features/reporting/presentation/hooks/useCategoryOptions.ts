import { useState, useCallback, useEffect, useMemo } from 'react';
import { CategoriesModule, Category } from '../../../categories';

const categoriesModule = new CategoriesModule();

export interface CategoryOptionItem {
  id: string;
  name: string;
}

export function useCategoryOptions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesModule.listCategoriesUseCase.execute({ includeArchived: false });
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryOptions: CategoryOptionItem[] = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id.value,
      name: cat.name.value,
    }));
  }, [categories]);

  return {
    categoryOptions,
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
  };
}
