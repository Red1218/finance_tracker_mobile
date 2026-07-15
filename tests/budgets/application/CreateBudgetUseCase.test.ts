import { describe, it, expect, beforeEach } from 'vitest';
import { CreateBudgetUseCase } from '../../../src/features/budgets/application/use-cases/CreateBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';

describe('CreateBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: CreateBudgetUseCase;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new CreateBudgetUseCase(repository);
  });

  it('should successfully create a budget', async () => {
    const request = {
      categoryId: 'cat-123',
      amount: 5000,
      currency: 'INR',
      period: '2024-01',
      status: 'Active' as const
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    if (result.success) {
      const savedList = await repository.list();
      expect(savedList.success).toBe(true);
      if (savedList.success && savedList.data) {
        expect(savedList.data.length).toBe(1);
        expect(savedList.data[0].amount.value).toBe(5000);
        expect(savedList.data[0].period.value).toBe('2024-01');
      }
    }
  });

  it('should prevent duplicate budgets for the same category and period', async () => {
    const request = {
      categoryId: 'cat-123',
      amount: 5000,
      currency: 'INR',
      period: '2024-01',
      status: 'Active' as const
    };

    const result1 = await useCase.execute(request);
    expect(result1.success).toBe(true);

    const result2 = await useCase.execute(request);
    expect(result2.success).toBe(false);
    if (!result2.success) {
      expect((result2.error as any).code).toBe('DUPLICATE_BUDGET');
    }
  });

  it('should return error if amount is invalid', async () => {
    const request = {
      categoryId: null,
      amount: -1000,
      currency: 'INR',
      period: '2024-01',
      status: 'Active' as const
    };

    const result = await useCase.execute(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as any).code).toBe('INVALID_AMOUNT');
    }
  });
});
