import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { DeleteBudgetUseCase } from '../use-cases/DeleteBudgetUseCase';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Result } from '../../../../platform/persistence';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('DeleteBudgetUseCase', () => {
  let budgetRepository: Mocked<IBudgetRepository>;
  let useCase: DeleteBudgetUseCase;
  
  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const mockBudget = Budget.restore({
    id: new BudgetId(validBudgetId),
    categoryId: null,
    amount: new BudgetAmount(5000),
    currency: new CurrencyCode('INR'),
    period: BudgetPeriod.Monthly,
    startDate: new Date('2026-06-01T00:00:00Z'), endDate: new Date('2026-06-30T23:59:59Z'),
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
    useCase = new DeleteBudgetUseCase(budgetRepository);
  });

  it('✓ delete success', async () => {
    budgetRepository.findById.mockResolvedValue(Result.success(mockBudget));
    budgetRepository.delete.mockResolvedValue(Result.success(undefined as void));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(true);
    expect(budgetRepository.delete).toHaveBeenCalledWith(expect.any(BudgetId));
    // Rule 6: Delete only removes the budget. Expenses remain untouched. (This is guaranteed since usecase does not interact with expenses repo)
  });

  it('fails if budget does not exist', async () => {
    budgetRepository.findById.mockResolvedValue(Result.success(null));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(false);
  });
});
