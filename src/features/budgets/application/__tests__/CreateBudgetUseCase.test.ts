import { describe, it, expect, beforeEach } from 'vitest';
import { CreateBudgetUseCase } from '../commands/CreateBudgetUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';
import { BudgetPeriodType } from '../../domain';
import { BudgetOverlapError } from '../errors/BudgetApplicationError';

describe('CreateBudgetUseCase', () => {
  let budgetRepo: InMemoryBudgetRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let useCase: CreateBudgetUseCase;

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    categoryRepo = new InMemoryCategoryRepository();

    const category = new Category({
      id: new CategoryId('cat-groceries'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: false,
    });
    categoryRepo.seed(category);

    useCase = new CreateBudgetUseCase(budgetRepo, categoryRepo);
  });

  it('should successfully create an overall budget returning BudgetDTO', async () => {
    const dto = await useCase.execute({
      amount: 10000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    expect(dto.amount).toBe(10000);
    expect(dto.currencyCode).toBe('INR');
    expect(dto.isOverall).toBe(true);
    expect(dto.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });


  it('should throw BudgetOverlapError on date range collision for same scope', async () => {
    await useCase.execute({
      categoryId: 'cat-groceries',
      amount: 5000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    await expect(
      useCase.execute({
        categoryId: 'cat-groceries',
        amount: 6000,
        currencyCode: 'INR',
        periodKind: BudgetPeriodType.Monthly,
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-07-15'),
      })
    ).rejects.toThrow(BudgetOverlapError);
  });
});
