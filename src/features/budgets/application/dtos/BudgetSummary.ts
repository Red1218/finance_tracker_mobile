export type BudgetHealthStatus = 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET';

export interface BudgetSummary {
  budgetId: string;
  categoryId: string | null;
  isOverall: boolean;
  budgetAmount: number;
  currency: string;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  healthStatus: BudgetHealthStatus;
  periodKind: string;
  startDate: Date;
  endDate: Date;
}
