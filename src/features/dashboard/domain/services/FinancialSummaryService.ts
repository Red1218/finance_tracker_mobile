import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';
import { FinancialSummary } from '../value-objects/FinancialSummary';
import { MonetaryAmount } from '../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';

export class FinancialSummaryService {
  /**
   * Calculates the FinancialSummary based on all transactions and period transactions.
   * INV-002: Total Balance is all-time, not period-scoped.
   * INV-003: Period Income and Period Expenses are scoped to the active ReportingPeriod.
   */
  public calculate(
    allTransactions: TransactionSnapshot[],
    activePeriod: ReportingPeriod,
    baseCurrency: string
  ): FinancialSummary {
    let totalBalance = 0;
    let periodIncome = 0;
    let periodExpenses = 0;

    for (const tx of allTransactions) {
      if (tx.amount.currency !== baseCurrency) {
        throw new Error('All transactions must be in the base currency for calculation');
      }

      if (tx.direction === 'Income') {
        totalBalance += tx.amount.amount;
        if (activePeriod.contains(tx.occurredAt)) {
          periodIncome += tx.amount.amount;
        }
      } else if (tx.direction === 'Expense') {
        totalBalance -= tx.amount.amount;
        if (activePeriod.contains(tx.occurredAt)) {
          periodExpenses += tx.amount.amount;
        }
      }
    }

    const netForPeriodAmount = periodIncome - periodExpenses;

    return new FinancialSummary(
      new MonetaryAmount(totalBalance, baseCurrency),
      new MonetaryAmount(periodIncome, baseCurrency),
      new MonetaryAmount(periodExpenses, baseCurrency),
      new MonetaryAmount(netForPeriodAmount, baseCurrency)
    );
  }
}
