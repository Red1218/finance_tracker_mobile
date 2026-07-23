import { SectionViewModel } from './SectionViewModel';

export interface BudgetHealthRow {
  readonly statusLabel: 'OnTrack' | 'AtRisk' | 'OverBudget';
  readonly amountConsumed: string;
  readonly budgetLimit: string;
  readonly consumptionRatio: number;
}

export interface BudgetHealthViewModel extends SectionViewModel<BudgetHealthRow[]> {
  readonly sectionType: 'BudgetHealth';
}
