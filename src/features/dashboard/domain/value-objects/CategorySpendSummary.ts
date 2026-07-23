import { MonetaryAmount } from './MonetaryAmount';

export class CategorySpendSummary {
  constructor(
    public readonly categoryId: string,
    public readonly totalAmountSpent: MonetaryAmount,
    public readonly proportionOfTotalSpending: number,
    public readonly rank: number
  ) {
    if (totalAmountSpent.amount < 0) {
      throw new Error('Total amount spent cannot be negative');
    }
    if (proportionOfTotalSpending < 0 || proportionOfTotalSpending > 100) {
      throw new Error('Proportion must be between 0 and 100');
    }
    if (rank <= 0 || !Number.isInteger(rank)) {
      throw new Error('Rank must be a positive integer');
    }
  }
}
