import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseBudgetRepository } from '../repositories/SupabaseBudgetRepository';
import { BudgetMapper } from '../mappers/BudgetMapper';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';
import { CategoryId } from '../../../categories/domain';

describe('SupabaseBudgetRepository', () => {
  let supabaseMock: any;
  let repository: SupabaseBudgetRepository;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const mockBudget = Budget.restore({
    id: new BudgetId(validBudgetId),
    categoryId: null,
    amount: new BudgetAmount(5000),
    currency: new CurrencyCode('INR'),
    period: BudgetPeriod.Monthly,
    startDate: new Date('2026-08-01T00:00:00Z'),
    endDate: new Date('2026-08-31T23:59:59Z'),
  });

  const mockRecord = BudgetMapper.toPersistence(mockBudget);

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      order: vi.fn(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
    };
    repository = new SupabaseBudgetRepository(supabaseMock);
  });

  it('✓ create', async () => {
    supabaseMock.insert.mockResolvedValue({ error: null });

    const result = await repository.create(mockBudget);

    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith('budgets');
    expect(supabaseMock.insert).toHaveBeenCalledWith(mockRecord);
  });

  it('✓ update', async () => {
    supabaseMock.update.mockReturnThis();
    supabaseMock.eq.mockResolvedValue({ error: null });

    const result = await repository.update(mockBudget);

    expect(result.success).toBe(true);
    expect(supabaseMock.update).toHaveBeenCalledWith({ amount: 5000 });
    expect(supabaseMock.eq).toHaveBeenCalledWith('id', mockRecord.id);
  });

  it('✓ delete', async () => {
    supabaseMock.delete.mockReturnThis();
    supabaseMock.eq.mockResolvedValue({ error: null });

    const result = await repository.delete(new BudgetId(validBudgetId));

    expect(result.success).toBe(true);
    expect(supabaseMock.delete).toHaveBeenCalled();
    expect(supabaseMock.eq).toHaveBeenCalledWith('id', validBudgetId);
  });

  it('✓ findById - success', async () => {
    supabaseMock.single.mockResolvedValue({ data: mockRecord, error: null });

    const result = await repository.findById(new BudgetId(validBudgetId));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.id.value).toBe(validBudgetId);
    }
  });

  it('✓ findById - not found (PGRST116)', async () => {
    supabaseMock.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const result = await repository.findById(new BudgetId(validBudgetId));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('✓ findOverlappingBudget - with category', async () => {
    supabaseMock.maybeSingle.mockResolvedValue({ data: mockRecord, error: null });

    const result = await repository.findOverlappingBudget(
      new CategoryId('a1234567-b89c-42d3-a456-426614174000'),
      BudgetPeriod.Monthly,
      new Date(),
      new Date()
    );

    expect(result.success).toBe(true);
    expect(supabaseMock.eq).toHaveBeenCalledWith('category_id', 'a1234567-b89c-42d3-a456-426614174000');
  });

  it('✓ findOverlappingBudget - overall (null category)', async () => {
    supabaseMock.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await repository.findOverlappingBudget(
      null,
      BudgetPeriod.Monthly,
      new Date(),
      new Date()
    );

    expect(result.success).toBe(true);
    expect(supabaseMock.is).toHaveBeenCalledWith('category_id', null);
  });

  it('✓ getBudgetSummary - uses aggregate query', async () => {
    supabaseMock.single
      .mockResolvedValueOnce({ data: mockRecord, error: null }) // Budget fetch
      .mockResolvedValueOnce({ data: { sum: 1500 }, error: null }); // Expenses sum fetch

    const result = await repository.getBudgetSummary(new BudgetId(validBudgetId));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.spentAmount).toBe(1500);
      expect(result.data?.budget.id.value).toBe(validBudgetId);
    }

    // Verify it queried expenses table correctly
    expect(supabaseMock.from).toHaveBeenCalledWith('expenses');
    expect(supabaseMock.select).toHaveBeenCalledWith('amount.sum()', { count: 'exact' });
  });

  it('✓ error translation (unhandled Supabase error)', async () => {
    supabaseMock.insert.mockResolvedValue({ error: { message: 'Network error' } });

    const result = await repository.create(mockBudget);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as any).message).toBe('Failed to create budget');
    }
  });
});
