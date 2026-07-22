import { BudgetPerformanceStatus } from '../../domain';

export interface BudgetPerformanceItem {
  readonly budgetId: string;
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly budgetAmount: number;
  readonly actualSpent: number;
  readonly remaining: number;
  readonly utilization: number;
  readonly status: BudgetPerformanceStatus;
}

export interface BudgetPerformanceResponse {
  readonly items: readonly BudgetPerformanceItem[];
}
