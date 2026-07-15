import { describe, it, expect } from 'vitest';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { BudgetDomainError } from '../../../src/features/budgets/domain/errors/BudgetDomainError';

describe('BudgetAmount', () => {
  it('should create a valid BudgetAmount', () => {
    const amount = new BudgetAmount(5000);
    expect(amount.value).toBe(5000);
  });

  it('should fail if amount is negative', () => {
    expect(() => new BudgetAmount(-100)).toThrow(BudgetDomainError);
    try {
      new BudgetAmount(-100);
    } catch (e: any) {
      expect(e.code).toBe('INVALID_AMOUNT');
    }
  });

  it('should fail if amount is not an integer', () => {
    expect(() => new BudgetAmount(10.5)).toThrow(BudgetDomainError);
  });
});
