export type BudgetPerformanceStatus = 'Safe' | 'Near Limit' | 'Over Budget';

export interface BudgetPerformance {
  readonly budgetId: string;
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly budgetAmount: number;
  readonly actualSpent: number;
  readonly remaining: number;
  readonly utilization: number;
  readonly status: BudgetPerformanceStatus;
}
