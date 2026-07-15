import { useMemo } from 'react';
import { useCategories } from '../../../categories/presentation/hooks';
import { CategoriesModule } from '../../../categories/composition';
import { CategoryBudgetOption } from '../models';

const categoriesModule = new CategoriesModule();

export function useCategoryOptions() {
  const { categories, isLoading, error, refresh } = useCategories(
    categoriesModule.listCategoriesUseCase
  );

  const categoryOptions: CategoryBudgetOption[] = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id.value,
      name: cat.name.value,
    }));
  }, [categories]);

  return {
    categoryOptions,
    categories,
    isLoading,
    error,
    refresh
  };
}
