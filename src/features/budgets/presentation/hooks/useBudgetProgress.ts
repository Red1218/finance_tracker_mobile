import { useMemo } from 'react';
import { useBudgets } from './useBudgets';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { BudgetViewModel } from '../models/BudgetViewModel';

const budgetsModule = new BudgetsModule();

export interface BudgetProgressItem {
  budgetId: string;
  categoryId: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export function useBudgetProgress() {
  const { budgets, isLoading, error, refresh } = useBudgets(budgetsModule.listBudgetsUseCase);

  const progressModels: BudgetProgressItem[] = useMemo(() => {
    return budgets.map((b: BudgetViewModel) => {
      const spentAmount = b.spentAmount ?? 0;
      const remainingAmount = b.remainingAmount ?? b.amount - spentAmount;
      const percentageUsed = b.percentageUsed ?? (b.amount > 0 ? (spentAmount / b.amount) * 100 : 0);

      return {
        budgetId: b.id,
        categoryId: b.categoryId,
        budgetAmount: b.amount,
        spentAmount,
        remainingAmount,
        percentageUsed,
        isOverBudget: spentAmount > b.amount,
      };
    });
  }, [budgets]);

  return {
    progressModels,
    isLoading,
    error,
    refresh,
  };
}
