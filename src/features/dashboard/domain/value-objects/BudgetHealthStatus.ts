import { MonetaryAmount } from './MonetaryAmount';

export type BudgetStatus = 'OnTrack' | 'AtRisk' | 'OverBudget';

/**
 * 'Explicit' — backed by a real, persisted Budget (category or explicit-overall). `budgetId` is that Budget's id.
 * 'Derived' — a Dashboard-only calculated aggregate (ADR-025). Never backed by a Budget; `budgetId` must be absent.
 */
export type BudgetHealthSource = 'Explicit' | 'Derived';

export class BudgetHealthStatus {
  public readonly status: BudgetStatus;
  public readonly consumptionRatio: number;
  public readonly remainingAmount: MonetaryAmount;

  constructor(
    public readonly source: BudgetHealthSource,
    public readonly amountConsumed: MonetaryAmount,
    public readonly limit: MonetaryAmount,
    public readonly categoryId?: string,
    public readonly budgetId?: string
  ) {
    if (source === 'Derived' && budgetId !== undefined) {
      throw new Error('A derived BudgetHealthStatus must not carry a persisted budgetId');
    }

    if (amountConsumed.currency !== limit.currency) {
      throw new Error('Currencies must match to calculate budget health');
    }

    if (limit.amount <= 0) {
      throw new Error('Budget limit must be greater than zero');
    }

    this.consumptionRatio = (amountConsumed.amount / limit.amount) * 100;
    const remaining = Math.max(limit.amount - amountConsumed.amount, 0);
    this.remainingAmount = new MonetaryAmount(remaining, limit.currency);

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
