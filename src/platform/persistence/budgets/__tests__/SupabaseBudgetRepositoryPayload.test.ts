import { describe, it, expect } from 'vitest';
import { BudgetMapper } from '../BudgetMapper';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../../../features/budgets/domain';
import { CategoryId } from '../../../../features/categories/domain';
import { CurrencyCode } from '../../../../features/accounts/domain/value-objects/CurrencyCode';

describe('SupabaseBudgetRepository Payload Contract', () => {
  it('emits exact canonical database keys and excludes non-existent period_type', () => {
    const budget = Budget.create({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174000'),
      categoryId: new CategoryId('123e4567-e89b-12d3-a456-426614174001'),
      amount: new BudgetAmount(10000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-08-01'), new Date('2026-08-31')),
    });

    const payload = BudgetMapper.toPersistence(budget, 'usr-test-123');

    // Explicit schema checks
    expect(payload).not.toHaveProperty('period_type');
    expect(payload).not.toHaveProperty('is_overall');
    expect(payload).toHaveProperty('period_kind', 'MONTHLY');
    expect(payload).toHaveProperty('user_id', 'usr-test-123');
    expect(payload).toHaveProperty('category_id', '123e4567-e89b-12d3-a456-426614174001');
    expect(payload).toHaveProperty('amount', 10000);
    expect(payload).toHaveProperty('currency_code', 'INR');

    // Strict payload keys verification matching public.budgets schema
    const payloadKeys = Object.keys(payload).sort();
    const expectedKeys = [
      'amount',
      'archived_at',
      'category_id',
      'currency_code',
      'end_date',
      'id',
      'period_kind',
      'start_date',
      'user_id',
    ].sort();

    expect(payloadKeys).toEqual(expectedKeys);
  });
});
