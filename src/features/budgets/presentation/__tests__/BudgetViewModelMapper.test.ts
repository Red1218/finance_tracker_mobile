import { describe, it, expect } from 'vitest';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';
import { CategoryId } from '../../../categories/domain';

describe('BudgetViewModelMapper', () => {
  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001';
  const startDate = new Date('2026-06-01T00:00:00.000Z');
  const endDate = new Date('2026-06-30T23:59:59.000Z');

  it('maps Budget aggregate to BudgetViewModel', () => {
    const budget = Budget.create({
      id: new BudgetId(validBudgetId),
      categoryId: new CategoryId(validCategoryId),
      amount: new BudgetAmount(15000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate),
    });

    const vm = BudgetViewModelMapper.toViewModel(budget);

    expect(vm.id).toBe(validBudgetId);
    expect(vm.categoryId).toBe(validCategoryId);
    expect(vm.isOverall).toBe(false);
    expect(vm.amount).toBe(15000);
    expect(vm.currency).toBe('INR');
    expect(vm.periodKind).toBe('MONTHLY');
    expect(vm.isArchived).toBe(false);
    expect(vm.archivedAt).toBeNull();
  });
});
