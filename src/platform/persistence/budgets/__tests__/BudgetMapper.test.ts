import { describe, it, expect } from 'vitest';
import { BudgetMapper } from '../BudgetMapper';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../../../features/budgets/domain';
import { CategoryId } from '../../../../features/categories/domain';
import { CurrencyCode } from '../../../../features/accounts/domain/value-objects/CurrencyCode';
import { BudgetRow } from '../../../../features/budgets/contracts/BudgetRow';

describe('BudgetMapper Round-Trip Symmetry', () => {
  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001';
  const startDate = new Date('2026-06-01T00:00:00.000Z');
  const endDate = new Date('2026-06-30T23:59:59.000Z');
  const archiveDate = new Date('2026-06-15T12:00:00.000Z');

  it('maintains round-trip symmetry between Budget aggregate and BudgetRow for category budget', () => {
    const budget = Budget.create({
      id: new BudgetId(validBudgetId),
      categoryId: new CategoryId(validCategoryId),
      amount: new BudgetAmount(15000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate),
      archivedAt: archiveDate,
    });

    const row = BudgetMapper.toPersistence(budget, 'usr-1');
    const reconstructed = BudgetMapper.toDomain(row);

    expect(reconstructed.id.value).toBe(budget.id.value);
    expect(reconstructed.categoryId?.value).toBe(budget.categoryId?.value);
    expect(reconstructed.isOverall).toBe(false);
    expect(reconstructed.amount.value).toBe(budget.amount.value);
    expect(reconstructed.currency.value).toBe(budget.currency.value);
    expect(reconstructed.period.kind).toBe(budget.period.kind);
    expect(reconstructed.startDate.toISOString()).toBe(budget.startDate.toISOString());
    expect(reconstructed.endDate.toISOString()).toBe(budget.endDate.toISOString());
    expect(reconstructed.isArchived).toBe(true);
    expect(reconstructed.archivedAt?.toISOString()).toBe(archiveDate.toISOString());
  });

  it('maintains round-trip symmetry for overall active budget', () => {
    const row: BudgetRow = {
      id: validBudgetId,
      user_id: 'usr-1',
      category_id: null,
      amount: 50000,
      currency_code: 'INR',
      period_type: 'MONTHLY',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      archived_at: null,
    };

    const budget = BudgetMapper.toDomain(row);
    expect(budget.isOverall).toBe(true);
    expect(budget.isArchived).toBe(false);

    const reRow = BudgetMapper.toPersistence(budget, 'usr-1');
    expect(reRow.category_id).toBeNull();
    expect(reRow.archived_at).toBeNull();
  });
});
