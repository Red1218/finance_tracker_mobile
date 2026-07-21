import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListBudgetsUseCase } from '../use-cases/ListBudgetsUseCase';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Result } from '../../../../platform/persistence';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('ListBudgetsUseCase', () => {
  let budgetRepository: vitest.Mocked<IBudgetRepository>;
  let useCase: ListBudgetsUseCase;

  const mockBudget = Budget.restore({
    id: new BudgetId('123e4567-e89b-12d3-a456-426614174000'),
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
    useCase = new ListBudgetsUseCase(budgetRepository);
  });

  it('✓ list budgets', async () => {
    budgetRepository.list.mockResolvedValue(Result.success([mockBudget]));

    const result = await useCase.execute({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(1);
      expect(result.data[0]).toBe(mockBudget);
    }
  });
});
