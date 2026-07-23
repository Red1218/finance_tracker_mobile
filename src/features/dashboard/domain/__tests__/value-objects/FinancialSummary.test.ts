import { describe, it, expect } from 'vitest';
import { FinancialSummary } from '../../value-objects/FinancialSummary';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('FinancialSummary', () => {
  it('should construct correctly', () => {
    const totalBalance = new MonetaryAmount(1000, 'USD');
    const periodIncome = new MonetaryAmount(2000, 'USD');
    const periodExpenses = new MonetaryAmount(500, 'USD');
    const netForPeriod = new MonetaryAmount(1500, 'USD');

    const summary = new FinancialSummary(totalBalance, periodIncome, periodExpenses, netForPeriod);

    expect(summary.totalBalance).toBe(totalBalance);
    expect(summary.periodIncome).toBe(periodIncome);
    expect(summary.periodExpenses).toBe(periodExpenses);
    expect(summary.netForPeriod).toBe(netForPeriod);
  });
});
