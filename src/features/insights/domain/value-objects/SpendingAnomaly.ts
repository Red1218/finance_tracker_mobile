import { InsightDomainError } from '../errors/InsightDomainError';

export class SpendingAnomaly {
  public readonly transactionId: string;
  public readonly categoryName: string;
  public readonly expectedAmount: number;
  public readonly actualAmount: number;
  public readonly deviationPercentage: number;
  public readonly baselinePeriod: string;

  constructor(props: {
    transactionId: string;
    categoryName: string;
    expectedAmount: number;
    actualAmount: number;
    baselinePeriod?: string;
  }) {
    if (!props.transactionId || props.transactionId.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Transaction ID is required.');
    }
    if (!props.categoryName || props.categoryName.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Category name is required.');
    }

    this.transactionId = props.transactionId.trim();
    this.categoryName = props.categoryName.trim();
    this.expectedAmount = Math.round(props.expectedAmount * 100) / 100;
    this.actualAmount = Math.round(props.actualAmount * 100) / 100;
    this.baselinePeriod = props.baselinePeriod || 'Rolling 90-Day Average';

    const diff = this.actualAmount - this.expectedAmount;
    this.deviationPercentage = props.expectedAmount > 0 
      ? Math.round((diff / props.expectedAmount) * 10000) / 100 
      : 100;

    Object.freeze(this);
  }
}
