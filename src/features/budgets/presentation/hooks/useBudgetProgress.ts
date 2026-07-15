import { useMemo } from 'react';
import { useBudgets } from './useBudgets';
import { useCategoryOptions } from './useCategoryOptions';
import { BudgetProgressViewModel } from '../models';

export function useBudgetProgress() {
  const { budgets, isLoading: isFetchingBudgets, error: fetchError, refresh: refreshBudgets } = useBudgets();
  const { categories, isLoading: isCategoriesLoading, refresh: refreshCategories } = useCategoryOptions();

  const isLoading = isCategoriesLoading || isFetchingBudgets;

  const progressModels: BudgetProgressViewModel[] = useMemo(() => {
    return budgets.map(b => {
      const cat = categories.find(c => c.id.value === b.categoryId);
      const spentAmount = 0; // Placeholder until Expenses linkage
      const rawProgress = b.amount > 0 ? (spentAmount / b.amount) * 100 : 0;
      const progressPercentage = Math.min(Math.max(rawProgress, 0), 100);
      
      return {
        budgetId: b.id,
        categoryId: b.categoryId,
        categoryName: cat ? cat.name.value : 'Overall Budget',
        budgetAmount: b.amount,
        spentAmount,
        remainingAmount: b.amount - spentAmount,
        progressPercentage,
        isOverBudget: spentAmount > b.amount,
        formattedBudgetAmount: b.formattedAmount,
        formattedSpentAmount: `${b.currency} 0.00`,
        formattedRemainingAmount: b.formattedAmount,
      };
    });
  }, [budgets, categories]);

  const refresh = async () => {
    await Promise.all([refreshBudgets(), refreshCategories()]);
  };

  return {
    progressModels,
    isLoading,
    error: fetchError,
    refresh
  };
}
