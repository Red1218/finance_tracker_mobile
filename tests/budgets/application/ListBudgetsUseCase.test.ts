import { describe, it, expect, beforeEach } from 'vitest';
import { ListBudgetsUseCase } from '../../../src/features/budgets/application/use-cases/ListBudgetsUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { CategoryId } from '../../../src/features/categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../src/features/expenses/domain/value-objects/CurrencyCode';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';

describe('ListBudgetsUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: ListBudgetsUseCase;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new ListBudgetsUseCase(repository);
  });

  it('should list all active budgets', async () => {
    const b1 = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174001'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });
    const b2 = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174002'),
      categoryId: new CategoryId('cat-2'),
      amount: new BudgetAmount(2000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });

    repository.seed([b1, b2]);

    const result = await useCase.execute({ period: '2024-01' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(2);
    }
  });

  it('should filter by category and status', async () => {
    const b1 = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174001'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });
    const b2 = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174002'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(2000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-02'),
      status: new BudgetStatus('Inactive'),
      deletedAt: null
    });

    repository.seed([b1, b2]);

    const result = await useCase.execute({ categoryId: 'cat-1', status: 'Inactive' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].id.value).toBe(b2.id.value);
    }
  });
});
