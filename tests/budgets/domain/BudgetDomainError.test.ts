import { describe, it, expect } from 'vitest';
import { BudgetDomainError } from '../../../src/features/budgets/domain/errors/BudgetDomainError';

describe('BudgetDomainError', () => {
  it('should instantiate with code and message', () => {
    const error = new BudgetDomainError('INVALID_AMOUNT', 'Amount must be greater than zero.');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('INVALID_AMOUNT');
    expect(error.message).toBe('Amount must be greater than zero.');
    expect(error.name).toBe('BudgetDomainError');
  });
});
