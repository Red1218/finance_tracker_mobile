import { describe, it, expect } from 'vitest';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus, BudgetStatusValue } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';
import { BudgetDomainError } from '../../../src/features/budgets/domain/errors/BudgetDomainError';

describe('Budget', () => {
  it('should create a valid Budget', () => {
    const budgetId = new BudgetId('123e4567-e89b-12d3-a456-426614174000');
    const amount = new BudgetAmount(10000);
    const period = new BudgetPeriod('2024-01');
    const status = new BudgetStatus('Active');

    const budget = new Budget({
      id: budgetId,
      categoryId: null,
      amount,
      currency: 'INR' as any,
      period,
      status,
      deletedAt: null
    });

    expect(budget.id.value).toBe(budgetId.value);
    expect(budget.amount.value).toBe(10000);
    expect(budget.period.value).toBe('2024-01');
    expect(budget.status.value).toBe('Active');
  });

  it('should update budget fields correctly', () => {
    const budgetId = new BudgetId('123e4567-e89b-12d3-a456-426614174000');
    const amount = new BudgetAmount(10000);
    const period = new BudgetPeriod('2024-01');
    const status = new BudgetStatus('Active');

    const budget = new Budget({
      id: budgetId,
      categoryId: null,
      amount,
      currency: 'INR' as any,
      period,
      status,
      deletedAt: null
    });

    const newAmount = new BudgetAmount(20000);
    const newStatus = new BudgetStatus('Inactive');

    const updateResult = budget.update({
      amount: newAmount,
      status: newStatus
    });

    expect(updateResult.amount.value).toBe(20000);
    expect(updateResult.status.value).toBe('Inactive');
  });
});
