import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { UpdateBudgetUseCase } from '../use-cases/UpdateBudgetUseCase';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Result } from '../../../../platform/persistence';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetDomainError } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('UpdateBudgetUseCase', () => {
  let budgetRepository: Mocked<IBudgetRepository>;
  let useCase: UpdateBudgetUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';

  // Future budget (active/future)
  const activeBudget = Budget.restore({
    id: new BudgetId(validBudgetId),
    categoryId: null,
    amount: new BudgetAmount(5000),
    currency: new CurrencyCode('INR'),
    period: BudgetPeriod.Monthly,
    startDate: new Date('2099-01-01T00:00:00Z'),
    endDate: new Date('2099-01-31T23:59:59Z'),
  });

  // Historical budget (end date in past)
  const historicalBudget = Budget.restore({
    id: new BudgetId(validBudgetId),
    categoryId: null,
    amount: new BudgetAmount(5000),
    currency: new CurrencyCode('INR'),
    period: BudgetPeriod.Monthly,
    startDate: new Date('2000-01-01T00:00:00Z'),
    endDate: new Date('2000-01-31T23:59:59Z'),
  });

  beforeEach(() => {
    budgetRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      findOverlappingBudget: vi.fn(),
      getBudgetSummary: vi.fn(),
    };
    useCase = new UpdateBudgetUseCase(budgetRepository);
  });

  it('✓ update success', async () => {
    budgetRepository.findById.mockResolvedValue(Result.success(activeBudget));
    budgetRepository.update.mockResolvedValue(Result.success(undefined as void));

    const result = await useCase.execute({ id: validBudgetId, amount: 8000 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount.value).toBe(8000);
      expect(budgetRepository.update).toHaveBeenCalled();
    }
  });

  it('✓ update historical budget throws error', async () => {
    budgetRepository.findById.mockResolvedValue(Result.success(historicalBudget));

    const result = await useCase.execute({ id: validBudgetId, amount: 8000 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BudgetDomainError);
      expect((result.error as BudgetDomainError).code).toBe('HISTORICAL_BUDGET_IMMUTABLE');
      expect(budgetRepository.update).not.toHaveBeenCalled();
    }
  });

  it('returns error if budget not found', async () => {
    budgetRepository.findById.mockResolvedValue(Result.success(null));

    const result = await useCase.execute({ id: validBudgetId, amount: 8000 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as BudgetDomainError).code).toBe('INVALID_IDENTIFIER');
    }
  });
});
