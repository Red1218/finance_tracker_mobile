import { describe, it, expect } from 'vitest';
import { Budget } from '../entities/Budget';
import { BudgetId } from '../value-objects/BudgetId';
import { BudgetAmount } from '../value-objects/BudgetAmount';
import { BudgetPeriod, BudgetPeriodType } from '../value-objects/BudgetPeriod';
import { BudgetDomainError } from '../errors/BudgetDomainError';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('Budget Aggregate', () => {
  const validBudgetId = new BudgetId('123e4567-e89b-12d3-a456-426614174000');
  const validCategoryId = new CategoryId('a1234567-b89c-42d3-a456-426614174000');
  const validAmount = new BudgetAmount(10000);
  const currency = new CurrencyCode('INR');
  const startDate = new Date('2026-06-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');
  const validPeriod = new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate);

  it('creates a valid category budget with isOverall returning false', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: validCategoryId,
      amount: validAmount,
      currency,
      period: validPeriod,
    });

    expect(budget.id.equals(validBudgetId)).toBe(true);
    expect(budget.categoryId?.equals(validCategoryId)).toBe(true);
    expect(budget.isOverall).toBe(false);
    expect(budget.amount.equals(validAmount)).toBe(true);
    expect(budget.period.kind).toBe(BudgetPeriodType.Monthly);
    expect(budget.startDate.toISOString()).toBe(startDate.toISOString());
    expect(budget.endDate.toISOString()).toBe(endDate.toISOString());
    expect(budget.isArchived).toBe(false);
    expect(budget.archivedAt).toBeNull();
  });

  it('creates a valid overall budget when categoryId is null', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: validPeriod,
    });

    expect(budget.categoryId).toBeNull();
    expect(budget.isOverall).toBe(true);
  });

  it('throws error when category is inactive during creation', () => {
    expect(() => {
      Budget.create(
        {
          id: validBudgetId,
          categoryId: validCategoryId,
          amount: validAmount,
          currency,
          period: validPeriod,
        },
        false
      );
    }).toThrowError(BudgetDomainError);
  });

  it('throws error when creating BudgetPeriod with invalid date range (start >= end)', () => {
    expect(() => {
      new BudgetPeriod(BudgetPeriodType.Custom, endDate, startDate);
    }).toThrowError(BudgetDomainError);
  });

  it('correctly detects intersecting date ranges between budget periods', () => {
    const p1 = new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-06-01'), new Date('2026-06-30'));
    const p2 = new BudgetPeriod(BudgetPeriodType.Custom, new Date('2026-06-15'), new Date('2026-07-15'));
    const p3 = new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-07-01'), new Date('2026-07-31'));

    expect(p1.intersects(p2)).toBe(true);
    expect(p1.intersects(p3)).toBe(false);
  });

  it('identifies historical budgets correctly', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: validPeriod,
    });

    const july1 = new Date('2026-07-01T00:00:00Z');
    expect(budget.isHistorical(july1)).toBe(true);

    const june15 = new Date('2026-06-15T00:00:00Z');
    expect(budget.isHistorical(june15)).toBe(false);
  });

  it('prevents updating historical budgets', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: validPeriod,
    });

    const july1 = new Date('2026-07-01T00:00:00Z');
    const newAmount = new BudgetAmount(20000);

    expect(() => budget.updateAmount(newAmount, july1)).toThrowError('Historical budgets remain immutable.');
  });

  it('archives budget setting archivedAt timestamp and allows restoring it', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: validPeriod,
    });

    const freezeTime = new Date('2026-06-10T12:00:00Z');
    const archived = budget.archive(freezeTime);

    expect(archived.isArchived).toBe(true);
    expect(archived.archivedAt).toEqual(freezeTime);

    const restored = archived.restore();
    expect(restored.isArchived).toBe(false);
    expect(restored.archivedAt).toBeNull();
  });
});
