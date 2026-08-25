import { ReportingDomainError } from '../errors/ReportingDomainError';

export class MonthOverMonthComparison {
  public readonly currentIncome: number;
  public readonly currentExpense: number;
  public readonly currentNetSavings: number;
  public readonly previousIncome: number;
  public readonly previousExpense: number;
  public readonly previousNetSavings: number;

  public readonly incomeDelta: number;
  public readonly expenseDelta: number;
  public readonly netSavingsDelta: number;

  public readonly incomePercentageChange: number | null;
  public readonly expensePercentageChange: number | null;
  public readonly netSavingsPercentageChange: number | null;

  public readonly isZeroBaseline: boolean;

  constructor(props: {
    currentIncome: number;
    currentExpense: number;
    currentNetSavings: number;
    previousIncome: number;
    previousExpense: number;
    previousNetSavings: number;
  }) {
    if (
      isNaN(props.currentIncome) ||
      isNaN(props.currentExpense) ||
      isNaN(props.currentNetSavings) ||
      isNaN(props.previousIncome) ||
      isNaN(props.previousExpense) ||
      isNaN(props.previousNetSavings)
    ) {
      throw new ReportingDomainError('INVALID_REPORTING_PERIOD', 'Comparison values cannot be NaN.');
    }

    this.currentIncome = Math.round(props.currentIncome * 100) / 100;
    this.currentExpense = Math.round(props.currentExpense * 100) / 100;
    this.currentNetSavings = Math.round(props.currentNetSavings * 100) / 100;

    this.previousIncome = Math.round(props.previousIncome * 100) / 100;
    this.previousExpense = Math.round(props.previousExpense * 100) / 100;
    this.previousNetSavings = Math.round(props.previousNetSavings * 100) / 100;

    this.incomeDelta = Math.round((this.currentIncome - this.previousIncome) * 100) / 100;
    this.expenseDelta = Math.round((this.currentExpense - this.previousExpense) * 100) / 100;
    this.netSavingsDelta = Math.round((this.currentNetSavings - this.previousNetSavings) * 100) / 100;

    // Income Percentage Change
    if (this.previousIncome > 0) {
      this.incomePercentageChange = Math.round((this.incomeDelta / this.previousIncome) * 100 * 10) / 10;
    } else {
      this.incomePercentageChange = this.currentIncome > 0 ? null : 0;
    }

    // Expense Percentage Change & Zero Baseline
    if (this.previousExpense > 0) {
      this.isZeroBaseline = false;
      this.expensePercentageChange = Math.round((this.expenseDelta / this.previousExpense) * 100 * 10) / 10;
    } else if (this.currentExpense > 0) {
      this.isZeroBaseline = true;
      this.expensePercentageChange = null;
    } else {
      this.isZeroBaseline = false;
      this.expensePercentageChange = 0;
    }

    // Net Savings Percentage Change
    if (this.previousNetSavings > 0) {
      this.netSavingsPercentageChange = Math.round((this.netSavingsDelta / this.previousNetSavings) * 100 * 10) / 10;
    } else {
      this.netSavingsPercentageChange = this.currentNetSavings > 0 ? null : 0;
    }

    Object.freeze(this);
  }
}
