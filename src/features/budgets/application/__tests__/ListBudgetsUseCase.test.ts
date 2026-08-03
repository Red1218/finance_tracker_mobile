import { describe, it, expect, beforeEach } from 'vitest';
import { ListBudgetsUseCase } from '../use-cases/ListBudgetsUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';

describe('ListBudgetsUseCase', () => {
  let repository: InMemoryBudgetRepository;
  let useCase: ListBudgetsUseCase;

  const id1 = '123e4567-e89b-12d3-a456-426614174001';
  const id2 = '123e4567-e89b-12d3-a456-426614174002';

  beforeEach(() => {
    repository = new InMemoryBudgetRepository();
    useCase = new ListBudgetsUseCase(repository);

    const b1 = Budget.create({
      id: new BudgetId(id1),
      categoryId: null,
      amount: new BudgetAmount(10000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-06-01'), new Date('2026-06-30')),
    });

    const b2 = Budget.create({
      id: new BudgetId(id2),
      categoryId: null,
      amount: new BudgetAmount(20000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-07-01'), new Date('2026-07-31')),
    });

    repository.seed(b1);
    repository.seed(b2.archive());
  });

  it('lists active budgets by default', async () => {
    const list = await useCase.execute();
    expect(list).toHaveLength(1);
    expect(list[0].id.value).toBe(id1);
  });

  it('includes archived budgets when includeArchived = true', async () => {
    const list = await useCase.execute({ includeArchived: true });
    expect(list).toHaveLength(2);
  });
});
