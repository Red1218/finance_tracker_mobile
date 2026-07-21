import { describe, it, expect } from 'vitest';
import { Budget } from '../entities/Budget';
import { BudgetId } from '../value-objects/BudgetId';
import { BudgetAmount } from '../value-objects/BudgetAmount';
import { BudgetPeriod } from '../value-objects/BudgetPeriod';
import { BudgetDomainError } from '../errors/BudgetDomainError';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('Budget Entity', () => {
  const validBudgetId = new BudgetId('123e4567-e89b-12d3-a456-426614174000');
  const validCategoryId = new CategoryId('a1234567-b89c-42d3-a456-426614174000');
  const validAmount = new BudgetAmount(10000);
  const currency = new CurrencyCode('INR');
  const startDate = new Date('2026-06-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');

  it('should create a valid monthly category budget', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: validCategoryId,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    expect(budget.id.equals(validBudgetId)).toBe(true);
    expect(budget.categoryId?.equals(validCategoryId)).toBe(true);
    expect(budget.amount.equals(validAmount)).toBe(true);
    expect(budget.period).toBe(BudgetPeriod.Monthly);
    expect(budget.startDate.toISOString()).toBe(startDate.toISOString());
    expect(budget.endDate.toISOString()).toBe(endDate.toISOString());
  });

  it('should create a valid yearly overall budget', () => {
    const yearStart = new Date('2026-01-01T00:00:00Z');
    const yearEnd = new Date('2026-12-31T23:59:59Z');

    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Yearly,
      startDate: yearStart,
      endDate: yearEnd,
    });

    expect(budget.categoryId).toBeNull();
    expect(budget.period).toBe(BudgetPeriod.Yearly);
  });

  it('should throw error when category is inactive', () => {
    expect(() => {
      Budget.create({
        id: validBudgetId,
        categoryId: validCategoryId,
        amount: validAmount,
        currency,
        period: BudgetPeriod.Monthly,
        startDate,
        endDate,
      }, false); // categoryIsActive = false
    }).toThrowError(BudgetDomainError);
  });

  it('should throw error for invalid date range (start >= end)', () => {
    expect(() => {
      Budget.create({
        id: validBudgetId,
        categoryId: null,
        amount: validAmount,
        currency,
        period: BudgetPeriod.Custom,
        startDate: endDate, // using end date as start
        endDate: startDate, // using start date as end
      });
    }).toThrowError(BudgetDomainError);
  });

  it('should correctly identify historical budgets', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    const july1 = new Date('2026-07-01T00:00:00Z');
    expect(budget.isHistorical(july1)).toBe(true);

    const june15 = new Date('2026-06-15T00:00:00Z');
    expect(budget.isHistorical(june15)).toBe(false);
  });

  it('should prevent updating historical budgets', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    const july1 = new Date('2026-07-01T00:00:00Z');
    const newAmount = new BudgetAmount(20000);

    expect(() => budget.updateAmount(newAmount, july1)).toThrowError(BudgetDomainError);
  });

  it('should allow updating active/future budgets', () => {
    const budget = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    const june15 = new Date('2026-06-15T00:00:00Z');
    const newAmount = new BudgetAmount(20000);

    const updatedBudget = budget.updateAmount(newAmount, june15);
    expect(updatedBudget.amount.equals(newAmount)).toBe(true);
  });

  it('restore should bypass creation-only business rules', () => {
    // Normally creating a budget with an inactive category throws an error.
    // Restoring should just reconstruct the entity.
    const budget = Budget.restore({
      id: validBudgetId,
      categoryId: validCategoryId,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    expect(budget.id.equals(validBudgetId)).toBe(true);
  });

  it('should check equality correctly', () => {
    const budget1 = Budget.create({
      id: validBudgetId,
      categoryId: null,
      amount: validAmount,
      currency,
      period: BudgetPeriod.Monthly,
      startDate,
      endDate,
    });

    const budget2 = Budget.restore({
      id: validBudgetId, // same ID
      categoryId: validCategoryId,
      amount: new BudgetAmount(500),
      currency,
      period: BudgetPeriod.Yearly,
      startDate,
      endDate,
    });

    expect(budget1.equals(budget2)).toBe(true);
  });
});
