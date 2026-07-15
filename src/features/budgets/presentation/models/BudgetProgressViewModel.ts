export interface BudgetProgressViewModel {
  budgetId: string;
  categoryId: string | null;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  isOverBudget: boolean;
  formattedBudgetAmount: string;
  formattedSpentAmount: string;
  formattedRemainingAmount: string;
}
