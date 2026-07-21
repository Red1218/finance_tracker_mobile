import { Budget } from '../../domain/entities/Budget';

export interface BudgetSummaryData {
  readonly budget: Budget;
  readonly spentAmount: number;
}
