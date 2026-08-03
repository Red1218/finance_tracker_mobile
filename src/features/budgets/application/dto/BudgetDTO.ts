export interface BudgetDTO {
  id: string;
  categoryId: string | null;
  amount: number;
  currencyCode: string;
  periodKind: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  isOverall: boolean;
  archivedAt: string | null;
}

export interface BudgetSummaryDTO {
  budget: BudgetDTO;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  healthStatus: 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET';
  budgetAmount?: number;
  currency?: string;
}
