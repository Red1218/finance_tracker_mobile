import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { GetBudgetSummaryUseCase } from '../use-cases/GetBudgetSummaryUseCase';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Result } from '../../../../platform/persistence';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('GetBudgetSummaryUseCase', () => {
  let budgetRepository: Mocked<IBudgetRepository>;
  let useCase: GetBudgetSummaryUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';

  const mockBudget = Budget.restore({
    id: new BudgetId(validBudgetId),
    categoryId: null,
    amount: new BudgetAmount(5000), // Total budget is 5000
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
    useCase = new GetBudgetSummaryUseCase(budgetRepository);
  });

  it('✓ computes budget summary correctly for OnTrack', async () => {
    // 2000 spent out of 5000 = 40% (OnTrack)
    budgetRepository.getBudgetSummary.mockResolvedValue(Result.success({
      budget: mockBudget,
      spentAmount: 2000,
    }));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.spentAmount).toBe(2000);
      expect(result.data.remainingAmount).toBe(3000);
      expect(result.data.percentageUsed).toBe(40);
      expect(result.data.status).toBe('OnTrack');
    }
  });

  it('✓ computes budget summary correctly for AtRisk', async () => {
    // 4250 spent out of 5000 = 85% (AtRisk >= 80%)
    budgetRepository.getBudgetSummary.mockResolvedValue(Result.success({
      budget: mockBudget,
      spentAmount: 4250,
    }));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remainingAmount).toBe(750);
      expect(result.data.percentageUsed).toBe(85);
      expect(result.data.status).toBe('AtRisk');
    }
  });

  it('✓ computes budget summary correctly for Overbudget', async () => {
    // 5500 spent out of 5000 = 110% (Overbudget >= 100%)
    budgetRepository.getBudgetSummary.mockResolvedValue(Result.success({
      budget: mockBudget,
      spentAmount: 5500,
    }));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remainingAmount).toBe(-500);
      expect(result.data.percentageUsed).toBeCloseTo(110);
      expect(result.data.status).toBe('Overbudget');
    }
  });

  it('fails if budget not found', async () => {
    budgetRepository.getBudgetSummary.mockResolvedValue(Result.success(null));

    const result = await useCase.execute({ id: validBudgetId });

    expect(result.success).toBe(false);
  });
});
