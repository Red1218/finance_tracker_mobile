import { BudgetPeriod } from '../../domain';

export interface BudgetViewModel {
  id: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
}

export interface BudgetSummaryViewModel {
  budget: BudgetViewModel;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'OnTrack' | 'AtRisk' | 'Overbudget';
}
