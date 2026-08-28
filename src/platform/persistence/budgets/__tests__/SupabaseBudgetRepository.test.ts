import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseBudgetRepository } from '../SupabaseBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../../../features/budgets/domain';
import { CategoryId } from '../../../../features/categories/domain';
import { CurrencyCode } from '../../../../features/accounts/domain/value-objects/CurrencyCode';

describe('SupabaseBudgetRepository Unit & Query Logic', () => {
  let mockClient: any;
  let repository: SupabaseBudgetRepository;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001';
  const startDate = new Date('2026-06-01T00:00:00.000Z');
  const endDate = new Date('2026-06-30T23:59:59.000Z');

  const sampleRow = {
    id: validBudgetId,
    user_id: 'usr-1',
    category_id: validCategoryId,
    amount: 15000,
    currency_code: 'INR',
    period_kind: 'MONTHLY',
    start_date: startDate.toISOString(),

    end_date: endDate.toISOString(),
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    archived_at: null,
  };

  beforeEach(() => {
    mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: sampleRow, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-1' } } }),
      },
    };

    repository = new SupabaseBudgetRepository(mockClient as any);
  });

  it('fetches budget by ID via findById', async () => {
    const result = await repository.findById(new BudgetId(validBudgetId));

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.id.value).toBe(validBudgetId);
      expect(result.data.categoryId?.value).toBe(validCategoryId);
      expect(result.data.amount.value).toBe(15000);
    }
  });

  it('saves budget row to Supabase', async () => {
    const budget = Budget.create({
      id: new BudgetId(validBudgetId),
      categoryId: new CategoryId(validCategoryId),
      amount: new BudgetAmount(15000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate),
    });

    const result = await repository.save(budget);
    expect(result.success).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('budgets');
    expect(mockClient.upsert).toHaveBeenCalled();
  });
});
