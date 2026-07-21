import { Budget } from '../../domain/entities/Budget';

export interface BudgetSummaryResponse {
  readonly budget: Budget;
  readonly spentAmount: number;
  readonly remainingAmount: number;
  readonly percentageUsed: number;
  readonly status: 'OnTrack' | 'AtRisk' | 'Overbudget';
}
