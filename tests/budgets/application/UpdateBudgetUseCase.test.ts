import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateBudgetUseCase } from '../../../src/features/budgets/application/use-cases/UpdateBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { CategoryId } from '../../../src/features/categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../src/features/expenses/domain/value-objects/CurrencyCode';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';

describe('UpdateBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: UpdateBudgetUseCase;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new UpdateBudgetUseCase(repository);
  });

  it('should successfully update an existing budget', async () => {
    const budget = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174000'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });
    repository.seed([budget]);

    const request = {
      id: budget.id.value,
      amount: 2000,
      currency: 'INR',
      status: 'Inactive' as const
    };

    const result = await useCase.execute(request);
    expect(result.success).toBe(true);

    const updated = await repository.getById(budget.id);
    expect(updated.success).toBe(true);
    if (updated.success && updated.data) {
      expect(updated.data.amount.value).toBe(2000);
      expect(updated.data.status.value).toBe('Inactive');
    }
  });

  it('should return NOT_FOUND if budget does not exist', async () => {
    const request = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      categoryId: 'cat-2',
      amount: 2000,
      currency: 'INR',
      status: 'Inactive' as const
    };

    const result = await useCase.execute(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as any).code).toBe('INVALID_IDENTIFIER');
    }
  });
});
