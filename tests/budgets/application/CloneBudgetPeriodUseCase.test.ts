import { describe, it, expect, beforeEach } from 'vitest';
import { CloneBudgetPeriodUseCase } from '../../../src/features/budgets/application/use-cases/CloneBudgetPeriodUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { BudgetAmount } from '../../../src/features/budgets/domain/value-objects/BudgetAmount';
import { CategoryId } from '../../../src/features/categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../src/features/expenses/domain/value-objects/CurrencyCode';
import { BudgetPeriod } from '../../../src/features/budgets/domain/value-objects/BudgetPeriod';
import { BudgetStatus } from '../../../src/features/budgets/domain/value-objects/BudgetStatus';

describe('CloneBudgetPeriodUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: CloneBudgetPeriodUseCase;

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new CloneBudgetPeriodUseCase(repository);
  });

  it('should successfully clone active budgets to a new period', async () => {
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
      categoryId: null,
      amount: new BudgetAmount(5000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Inactive'), // Should not be cloned
      deletedAt: null
    });

    repository.seed([b1, b2]);

    const result = await useCase.execute({ sourcePeriod: '2024-01', targetPeriod: '2024-02' });
    expect(result.success).toBe(true);

    const listResult = await repository.list();
    if (listResult.success) {
      const all = listResult.data;
      expect(all.length).toBe(3); // 2 original + 1 cloned
      const cloned = all.filter(b => b.period.value === '2024-02');
      expect(cloned.length).toBe(1);
      expect(cloned[0].categoryId?.value).toBe('cat-1');
      expect(cloned[0].amount.value).toBe(1000);
      expect(cloned[0].status.value).toBe('Active');
    }
  });

  it('should return error if source period is invalid', async () => {
    const result = await useCase.execute({ sourcePeriod: 'invalid', targetPeriod: '2024-02' });
    expect(result.success).toBe(false);
  });

  it('should skip budgets that already exist in target period', async () => {
    const b1 = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174001'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-01'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });
    // Already exists in target
    const bTarget = new Budget({
      id: new BudgetId('123e4567-e89b-12d3-a456-426614174003'),
      categoryId: new CategoryId('cat-1'),
      amount: new BudgetAmount(2000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod('2024-02'),
      status: new BudgetStatus('Active'),
      deletedAt: null
    });

    repository.seed([b1, bTarget]);

    const result = await useCase.execute({ sourcePeriod: '2024-01', targetPeriod: '2024-02' });
    expect(result.success).toBe(true);

    // It should not have created another cat-1 in 2024-02
    const listResult = await repository.list();
    if (listResult.success) {
      expect(listResult.data.length).toBe(2);
    }
  });
});
