import { SectionViewModel } from './SectionViewModel';

export interface BudgetHealthRow {
  readonly statusLabel: 'OnTrack' | 'AtRisk' | 'OverBudget';
  readonly amountConsumed: string;
  readonly budgetLimit: string;
  readonly remainingAmount?: string;
  readonly consumptionRatio: number;
  readonly categoryId?: string;
  readonly categoryName?: string;
  readonly isOverall?: boolean;
}

export interface BudgetHealthViewModel extends SectionViewModel<BudgetHealthRow[]> {
  readonly sectionType: 'BudgetHealth';
}
