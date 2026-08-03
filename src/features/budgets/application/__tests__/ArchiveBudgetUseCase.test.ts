import { describe, it, expect, beforeEach } from 'vitest';
import { ArchiveBudgetUseCase } from '../use-cases/ArchiveBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';

describe('ArchiveBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: ArchiveBudgetUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new ArchiveBudgetUseCase(repository);

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

  it('successfully archives a budget setting archivedAt timestamp', async () => {
    const freezeTime = new Date('2026-06-15T10:00:00Z');
    await useCase.execute({ id: validBudgetId, archivedAt: freezeTime });

    const result = await repository.getById(new BudgetId(validBudgetId));
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isArchived).toBe(true);
      expect(result.data.archivedAt).toEqual(freezeTime);
    }
  });
});
