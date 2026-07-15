import { describe, it, expect } from 'vitest';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';
import { BudgetDomainError } from '../../../src/features/budgets/domain/errors/BudgetDomainError';

describe('BudgetStatus', () => {
  it('should create Active status', () => {
    const status = new BudgetStatus('Active');
    expect(status.value).toBe('Active');
    expect(status.isActive()).toBe(true);
  });

  it('should create Inactive status', () => {
    const status = new BudgetStatus('Inactive');
    expect(status.value).toBe('Inactive');
    expect(status.isActive()).toBe(false);
  });

  it('should fail on invalid status', () => {
    expect(() => new BudgetStatus('Unknown')).toThrow(BudgetDomainError);
  });
});
