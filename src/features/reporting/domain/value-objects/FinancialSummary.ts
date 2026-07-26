import { ReportingDomainError } from '../errors/ReportingDomainError';

export class FinancialSummary {
  public readonly totalIncome: number;
  public readonly totalExpense: number;

  constructor(totalIncome: number, totalExpense: number) {
    if (typeof totalIncome !== 'number' || isNaN(totalIncome) || totalIncome < 0) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Total income must be a valid non-negative number.');
    }
    if (typeof totalExpense !== 'number' || isNaN(totalExpense) || totalExpense < 0) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Total expense must be a valid non-negative number.');
    }

    this.totalIncome = Math.round(totalIncome * 100) / 100;
    this.totalExpense = Math.round(totalExpense * 100) / 100;

    Object.freeze(this);
  }

  public get netSavings(): number {
    return Math.round((this.totalIncome - this.totalExpense) * 100) / 100;
  }

  public get savingsRatePercentage(): number {
    if (this.totalIncome <= 0) {
      return 0; // Return 0% explicitly when totalIncome is 0 to avoid division by zero
    }
    const rate = ((this.totalIncome - this.totalExpense) / this.totalIncome) * 100;
    return Math.round(rate * 100) / 100;
  }
}
