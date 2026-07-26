import { describe, it, expect } from 'vitest';
import { CategoryKind } from '../value-objects/CategoryKind';

describe('CategoryKind', () => {
  it('should define correct string values for Income and Expense', () => {
    expect(CategoryKind.Income).toBe('INCOME');
    expect(CategoryKind.Expense).toBe('EXPENSE');
  });
});
