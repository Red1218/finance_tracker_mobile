import { MonetaryAmount } from './MonetaryAmount';

export class FinancialSummary {
  constructor(
    public readonly totalBalance: MonetaryAmount,
    public readonly periodIncome: MonetaryAmount,
    public readonly periodExpenses: MonetaryAmount,
    public readonly netForPeriod: MonetaryAmount
  ) {}
}
