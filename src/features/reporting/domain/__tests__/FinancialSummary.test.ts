import { describe, it, expect } from 'vitest';
import { FinancialSummary } from '../value-objects/FinancialSummary';
import { ReportingDomainError } from '../errors/ReportingDomainError';

describe('FinancialSummary Value Object', () => {
  it('computes netSavings and savingsRatePercentage deterministically', () => {
    const summary = new FinancialSummary(50000, 30000);

    expect(summary.totalIncome).toBe(50000);
    expect(summary.totalExpense).toBe(30000);
    expect(summary.netSavings).toBe(20000);
    expect(summary.savingsRatePercentage).toBe(40);
  });

  it('handles zero-income safely without division by zero', () => {
    const summary = new FinancialSummary(0, 15000);

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(15000);
    expect(summary.netSavings).toBe(-15000);
    expect(summary.savingsRatePercentage).toBe(0); // 0% return invariant
  });

  it('rejects negative income or expense values', () => {
    expect(() => new FinancialSummary(-100, 50)).toThrow(ReportingDomainError);
    expect(() => new FinancialSummary(100, -50)).toThrow(ReportingDomainError);
  });
});
