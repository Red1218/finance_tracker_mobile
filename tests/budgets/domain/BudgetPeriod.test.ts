import { describe, it, expect } from 'vitest';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetDomainError } from '../../../src/features/budgets/domain/errors/BudgetDomainError';

describe('BudgetPeriod', () => {
  it('should create a valid BudgetPeriod', () => {
    const period = new BudgetPeriod('2024-01');
    expect(period.value).toBe('2024-01');
    expect(period.year).toBe(2024);
    expect(period.month).toBe(1);
  });

  it('should fail with invalid format', () => {
    expect(() => new BudgetPeriod('01-2024')).toThrow(BudgetDomainError);
  });

  it('should fail with invalid month', () => {
    expect(() => new BudgetPeriod('2024-13')).toThrow(BudgetDomainError);
  });

  it('should get previous period', () => {
    const period = new BudgetPeriod('2024-01');
    const prev = period.previous();
    expect(prev.value).toBe('2023-12');
  });

  it('should get next period', () => {
    const period = new BudgetPeriod('2023-12');
    const next = period.next();
    expect(next.value).toBe('2024-01');
  });

  it('should check if it contains a date', () => {
    const period = new BudgetPeriod('2024-02');
    const dateInside = new Date('2024-02-15T12:00:00Z');
    const dateOutside = new Date('2024-03-01T00:00:00Z');

    expect(period.contains(dateInside)).toBe(true);
    expect(period.contains(dateOutside)).toBe(false);
  });
});
