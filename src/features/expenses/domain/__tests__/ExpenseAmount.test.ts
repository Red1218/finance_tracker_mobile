import { describe, it, expect } from 'vitest';
import { ExpenseAmount } from '../value-objects/ExpenseAmount';

describe('ExpenseAmount', () => {
  it('should create a valid expense amount', () => {
    const amount = new ExpenseAmount(10050); // $100.50
    expect(amount.value).toBe(10050);
  });

  it('should fail if amount is negative', () => {
    expect(() => new ExpenseAmount(-10)).toThrow();
  });

  it('should fail if amount is zero', () => {
    expect(() => new ExpenseAmount(0)).toThrow();
  });

  it('should test equality correctly', () => {
    const amount1 = new ExpenseAmount(100);
    const amount2 = new ExpenseAmount(100);
    const amount3 = new ExpenseAmount(200);

    expect(amount1.equals(amount2)).toBe(true);
    expect(amount1.equals(amount3)).toBe(false);
  });
});
