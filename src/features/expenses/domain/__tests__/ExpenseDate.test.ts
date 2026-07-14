import { describe, it, expect } from 'vitest';
import { ExpenseDate } from '../value-objects/ExpenseDate';

describe('ExpenseDate', () => {
  it('should create a valid expense date', () => {
    const now = Date.now();
    const date = new ExpenseDate(now);
    expect(date.value).toBe(now);
  });

  it('should test equality correctly', () => {
    const now = Date.now();
    const date1 = new ExpenseDate(now);
    const date2 = new ExpenseDate(now);
    const date3 = new ExpenseDate(now + 1000);

    expect(date1.equals(date2)).toBe(true);
    expect(date1.equals(date3)).toBe(false);
  });
});
