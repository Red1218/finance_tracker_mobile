import { describe, it, expect } from 'vitest';
import { CategorySpendSummary } from '../../value-objects/CategorySpendSummary';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('CategorySpendSummary', () => {
  it('should construct correctly', () => {
    const amount = new MonetaryAmount(100, 'USD');
    const summary = new CategorySpendSummary('cat1', amount, 25, 1);
    
    expect(summary.categoryId).toBe('cat1');
    expect(summary.totalAmountSpent).toBe(amount);
    expect(summary.proportionOfTotalSpending).toBe(25);
    expect(summary.rank).toBe(1);
  });

  it('should throw if total amount spent is negative', () => {
    const amount = new MonetaryAmount(-10, 'USD');
    expect(() => new CategorySpendSummary('cat1', amount, 25, 1)).toThrow('Total amount spent cannot be negative');
  });

  it('should throw if proportion is out of bounds', () => {
    const amount = new MonetaryAmount(100, 'USD');
    expect(() => new CategorySpendSummary('cat1', amount, -1, 1)).toThrow('Proportion must be between 0 and 100');
    expect(() => new CategorySpendSummary('cat1', amount, 101, 1)).toThrow('Proportion must be between 0 and 100');
  });

  it('should throw if rank is invalid', () => {
    const amount = new MonetaryAmount(100, 'USD');
    expect(() => new CategorySpendSummary('cat1', amount, 25, 0)).toThrow('Rank must be a positive integer');
    expect(() => new CategorySpendSummary('cat1', amount, 25, 1.5)).toThrow('Rank must be a positive integer');
  });
});
