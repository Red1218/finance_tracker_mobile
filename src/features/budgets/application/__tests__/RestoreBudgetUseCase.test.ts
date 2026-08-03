import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreBudgetUseCase } from '../use-cases/RestoreBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';

describe('RestoreBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: RestoreBudgetUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new RestoreBudgetUseCase(repository);

    const budget = Budget.create({
      id: new BudgetId(validBudgetId),
      categoryId: null,
      amount: new BudgetAmount(10000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-06-01'), new Date('2026-06-30')),
    });
    repository.seed(budget.archive());
  });

  it('successfully restores an archived budget setting archivedAt to null', async () => {
    await useCase.execute({ id: validBudgetId });

    const result = await repository.getById(new BudgetId(validBudgetId));
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isArchived).toBe(false);
      expect(result.data.archivedAt).toBeNull();
    }
  });
});
