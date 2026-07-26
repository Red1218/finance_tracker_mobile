import { describe, it, expect } from 'vitest';
import { CategorySpendBreakdown } from '../value-objects/CategorySpendBreakdown';
import { ReportingDomainError } from '../errors/ReportingDomainError';

describe('CategorySpendBreakdown Value Object', () => {
  it('creates valid CategorySpendBreakdown instance', () => {
    const breakdown = new CategorySpendBreakdown({
      categoryId: 'cat-123',
      categoryName: 'Groceries',
      spentAmount: 12500,
      percentage: 25.5,
    });

    expect(breakdown.categoryId).toBe('cat-123');
    expect(breakdown.categoryName).toBe('Groceries');
    expect(breakdown.spentAmount).toBe(12500);
    expect(breakdown.percentage).toBe(25.5);
  });

  it('rejects empty categoryId or name', () => {
    expect(
      () =>
        new CategorySpendBreakdown({
          categoryId: '',
          categoryName: 'Groceries',
          spentAmount: 100,
          percentage: 10,
        })
    ).toThrow(ReportingDomainError);

    expect(
      () =>
        new CategorySpendBreakdown({
          categoryId: 'cat-1',
          categoryName: '',
          spentAmount: 100,
          percentage: 10,
        })
    ).toThrow(ReportingDomainError);
  });

  it('rejects invalid percentage values outside 0-100 range', () => {
    expect(
      () =>
        new CategorySpendBreakdown({
          categoryId: 'cat-1',
          categoryName: 'Rent',
          spentAmount: 100,
          percentage: 120,
        })
    ).toThrow(ReportingDomainError);
  });
});
