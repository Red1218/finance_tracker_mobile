import { describe, it, expect } from 'vitest';
import { FinancialSummaryService } from '../../services/FinancialSummaryService';
import { TransactionSnapshot } from '../../snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('FinancialSummaryService', () => {
  it('should calculate summary accurately based on active period', () => {
    const service = new FinancialSummaryService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(1000, 'USD'), direction: 'Income', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Salary' },
      { id: '2', amount: new MonetaryAmount(300, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-15'), categoryId: 'cat2', description: 'Groceries' },
      // Outside period
      { id: '3', amount: new MonetaryAmount(500, 'USD'), direction: 'Income', occurredAt: new Date('2026-06-15'), categoryId: 'cat1', description: 'Old Salary' },
    ];

    const summary = service.calculate(transactions, period, 'USD');

    // Total balance includes all-time transactions (1000 - 300 + 500 = 1200)
    expect(summary.totalBalance.amount).toBe(1200);

    // Period income includes only within July (1000)
    expect(summary.periodIncome.amount).toBe(1000);

    // Period expenses includes only within July (300)
    expect(summary.periodExpenses.amount).toBe(300);

    // Net for period (1000 - 300 = 700)
    expect(summary.netForPeriod.amount).toBe(700);
  });

  it('should throw if currency does not match base currency', () => {
    const service = new FinancialSummaryService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(1000, 'EUR'), direction: 'Income', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Salary' },
    ];

    expect(() => service.calculate(transactions, period, 'USD')).toThrow('All transactions must be in the base currency for calculation');
  });
});
