import { describe, it, expect, beforeEach } from 'vitest';
import { CreateBudgetUseCase } from '../use-cases/CreateBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { BudgetPeriodType, BudgetDomainError } from '../../domain';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';

describe('CreateBudgetUseCase', () => {
  let budgetRepo: InMemoryBudgetRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let useCase: CreateBudgetUseCase;

  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001';
  const startDate = new Date('2026-06-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    categoryRepo = new InMemoryCategoryRepository();
    useCase = new CreateBudgetUseCase(budgetRepo, categoryRepo);

    categoryRepo.seed(
      new Category({
        id: new CategoryId(validCategoryId),
        name: new CategoryName('Groceries'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );

    categoryRepo.seed(
      new Category({
        id: new CategoryId('123e4567-e89b-12d3-a456-426614174099'),
        name: new CategoryName('Old Subscriptions'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: new Date(),
      })
    );
  });

  it('successfully creates a category budget for an active category', async () => {
    const budget = await useCase.execute({
      categoryId: validCategoryId,
      amount: 15000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });

    expect(budget.amount.value).toBe(15000);
    expect(budget.categoryId?.value).toBe(validCategoryId);
    expect(budget.isOverall).toBe(false);
    expect(budget.period.kind).toBe(BudgetPeriodType.Monthly);

    const savedRes = await budgetRepo.list();
    expect(savedRes.success).toBe(true);
    if (savedRes.success) {
      expect(savedRes.data).toHaveLength(1);
    }
  });

  it('successfully creates an overall budget when categoryId is null', async () => {
    const budget = await useCase.execute({
      categoryId: null,
      amount: 50000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });

    expect(budget.categoryId).toBeNull();
    expect(budget.isOverall).toBe(true);
  });

  it('rejects creation when category is inactive or archived (CATEGORY_INACTIVE)', async () => {
    await expect(
      useCase.execute({
        categoryId: '123e4567-e89b-12d3-a456-426614174099',
        amount: 10000,
        currencyCode: 'INR',
        periodKind: BudgetPeriodType.Monthly,
        startDate,
        endDate,
      })
    ).rejects.toThrowError(BudgetDomainError);
  });

  it('rejects creation when date range intersects with an existing active budget of the same scope (OVERLAPPING_BUDGET)', async () => {
    await useCase.execute({
      categoryId: validCategoryId,
      amount: 15000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    // Intersecting budget: June 15 to July 15
    await expect(
      useCase.execute({
        categoryId: validCategoryId,
        amount: 20000,
        currencyCode: 'INR',
        periodKind: BudgetPeriodType.Custom,
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-07-15'),
      })
    ).rejects.toThrowError(BudgetDomainError);
  });
});
