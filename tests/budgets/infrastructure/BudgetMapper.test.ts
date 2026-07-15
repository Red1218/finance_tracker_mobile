import { describe, it, expect } from 'vitest';
import { BudgetMapper } from '../../../src/platform/persistence/budgets/BudgetMapper';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';
import { CategoryId } from '../../../src/features/categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../src/features/expenses/domain/value-objects/CurrencyCode';

describe('BudgetMapper', () => {
  it('should map domain to persistence symmetrically', () => {
    const budget = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174000'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });

    const row = BudgetMapper.toPersistence(budget) as any;
    expect(row.id).toBe(budget.id.value);
    expect(row.category_id).toBe('cat-1');
    expect(row.amount).toBe(1000);
    expect(row.currency_code).toBe('INR');
    expect(row.period).toBe('2024-01');
    expect(row.status).toBe('Active');
    expect(row.deleted_at).toBeNull();

    const mappedBack = BudgetMapper.toDomain(row);
    expect(mappedBack.id.value).toBe(budget.id.value);
    expect(mappedBack.categoryId?.value).toBe(budget.categoryId?.value);
    expect(mappedBack.amount.value).toBe(budget.amount.value);
    expect(mappedBack.period.value).toBe(budget.period.value);
    expect(mappedBack.status.value).toBe(budget.status.value);
    expect(mappedBack.deletedAt).toBeNull();
  });
});
