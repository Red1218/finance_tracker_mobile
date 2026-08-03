import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateBudgetUseCase } from '../use-cases/UpdateBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';

describe('UpdateBudgetUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: UpdateBudgetUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const startDate = new Date('2026-06-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new UpdateBudgetUseCase(repository);

    repository.seed(
      Budget.create({
        id: new BudgetId(validBudgetId),
        categoryId: null,
        amount: new BudgetAmount(10000),
        currency: new CurrencyCode('INR'),
        period: new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate),
      })
    );
  });

  it('successfully updates budget amount for an active non-historical budget', async () => {
    const june15 = new Date('2026-06-15T00:00:00Z');
    const updated = await useCase.execute({ id: validBudgetId, newAmount: 25000, currentDate: june15 });

    expect(updated.amount.value).toBe(25000);
  });

  it('rejects updating historical budgets (HISTORICAL_BUDGET_IMMUTABLE)', async () => {
    const july1 = new Date('2026-07-01T00:00:00Z');
    await expect(
      useCase.execute({ id: validBudgetId, newAmount: 30000, currentDate: july1 })
    ).rejects.toThrowError('Historical budgets remain immutable.');
  });

  it('rejects updating archived budgets (BUDGET_ALREADY_ARCHIVED)', async () => {
    await repository.archive(new BudgetId(validBudgetId));

    await expect(
      useCase.execute({ id: validBudgetId, newAmount: 30000, currentDate: new Date('2026-06-15') })
    ).rejects.toThrowError('Archived budgets cannot be updated.');
  });
});
