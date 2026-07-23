import { MonetaryAmount } from './MonetaryAmount';

export type BudgetStatus = 'OnTrack' | 'AtRisk' | 'OverBudget';

export class BudgetHealthStatus {
  public readonly status: BudgetStatus;
  public readonly consumptionRatio: number;

  constructor(
    public readonly budgetId: string,
    public readonly amountConsumed: MonetaryAmount,
    public readonly limit: MonetaryAmount
  ) {
    if (amountConsumed.currency !== limit.currency) {
      throw new Error('Currencies must match to calculate budget health');
    }

    if (limit.amount <= 0) {
      throw new Error('Budget limit must be greater than zero');
    }

    this.consumptionRatio = (amountConsumed.amount / limit.amount) * 100;

    // INV-008: BudgetHealthStatus thresholds are fixed: OnTrack <= 80%, AtRisk > 80% and <= 100%, OverBudget > 100%.
    if (this.consumptionRatio <= 80) {
      this.status = 'OnTrack';
    } else if (this.consumptionRatio <= 100) {
      this.status = 'AtRisk';
    } else {
      this.status = 'OverBudget';
    }
  }
}
