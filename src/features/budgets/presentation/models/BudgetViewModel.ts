export type BudgetHealthStatusViewModel = 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET';

export interface BudgetViewModel {
  id: string;
  categoryId: string | null;
  isOverall: boolean;
  amount: number;
  currency: string;
  periodKind: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  archivedAt: string | null;
  spentAmount?: number;
  remainingAmount?: number;
  percentageUsed?: number;
  healthStatus?: BudgetHealthStatusViewModel;
}
