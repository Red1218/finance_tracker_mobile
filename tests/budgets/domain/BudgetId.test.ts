import { describe, it, expect } from 'vitest';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';

describe('BudgetId', () => {
  it('should restore from an existing string', () => {
    const idStr = '123e4567-e89b-12d3-a456-426614174000';
    const id = new BudgetId(idStr);
    expect(id.value).toBe(idStr);
  });

  it('should fail on invalid UUID', () => {
    expect(() => new BudgetId('invalid-id')).toThrow();
  });
});
