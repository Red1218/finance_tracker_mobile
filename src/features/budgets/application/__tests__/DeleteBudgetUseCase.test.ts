import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteBudgetUseCase } from '../use-cases/DeleteBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('DeleteBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: DeleteBudgetUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new DeleteBudgetUseCase(repository);

    repository.seed(
      Budget.create({
        id: new BudgetId(validBudgetId),
        categoryId: null,
        amount: new BudgetAmount(10000),
        currency: new CurrencyCode('INR'),
        period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-06-01'), new Date('2026-06-30')),
      })
    );
  });

  it('archives budget on delete', async () => {
    await useCase.execute(validBudgetId);

    const result = await repository.getById(new BudgetId(validBudgetId));
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isArchived).toBe(true);
    }
  });
});
