import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteBudgetUseCase } from '../../../src/features/budgets/application/use-cases/DeleteBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { CategoryId } from '../../../src/features/categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../src/features/expenses/domain/value-objects/CurrencyCode';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';

describe('DeleteBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: DeleteBudgetUseCase;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new DeleteBudgetUseCase(repository);
  });

  it('should successfully delete an existing budget', async () => {
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

    const result = await useCase.execute({ id: budget.id.value });
    expect(result.success).toBe(true);

    const deleted = await repository.getById(budget.id);
    expect(deleted.success).toBe(false || (deleted.success && deleted.data === null));
  });

  it('should return error if budget not found', async () => {
    const result = await useCase.execute({ id: '123e4567-e89b-12d3-a456-426614174001' });
    expect(result.success).toBe(false);
  });
});
