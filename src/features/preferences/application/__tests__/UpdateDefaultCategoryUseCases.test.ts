import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateDefaultExpenseCategoryUseCase, UpdateDefaultIncomeCategoryUseCase } from '../commands/UpdateDefaultCategoryUseCases';
import { InitializePreferencesUseCase } from '../commands/InitializePreferencesUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';

describe('UpdateDefaultCategory Use Cases', () => {
  let preferencesRepo: InMemoryPreferencesRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let initUseCase: InitializePreferencesUseCase;
  let updateExpenseUseCase: UpdateDefaultExpenseCategoryUseCase;
  let updateIncomeUseCase: UpdateDefaultIncomeCategoryUseCase;

  const expenseCategory = new Category({
    id: new CategoryId('cat-exp-1'),
    name: new CategoryName('Groceries'),
    kind: CategoryKind.Expense,
    isSystem: false,
    archivedAt: null,
  });

  const incomeCategory = new Category({
    id: new CategoryId('cat-inc-1'),
    name: new CategoryName('Salary'),
    kind: CategoryKind.Income,
    isSystem: false,
    archivedAt: null,
  });

  beforeEach(async () => {
    preferencesRepo = new InMemoryPreferencesRepository();
    categoryRepo = new InMemoryCategoryRepository();
    categoryRepo.seed(expenseCategory);
    categoryRepo.seed(incomeCategory);

    initUseCase = new InitializePreferencesUseCase(preferencesRepo);
    await initUseCase.execute('user-test-1');

    updateExpenseUseCase = new UpdateDefaultExpenseCategoryUseCase(preferencesRepo, categoryRepo);
    updateIncomeUseCase = new UpdateDefaultIncomeCategoryUseCase(preferencesRepo, categoryRepo);
  });

  it('should successfully update default expense category when category is Expense kind', async () => {
    const dto = await updateExpenseUseCase.execute({ categoryId: 'cat-exp-1', userId: 'user-test-1' });

    expect(dto.defaultExpenseCategoryId).toBe('cat-exp-1');
  });

  it('should fail updating default expense category if category is Income kind', async () => {
    await expect(
      updateExpenseUseCase.execute({ categoryId: 'cat-inc-1', userId: 'user-test-1' })
    ).rejects.toThrow();
  });

  it('should successfully update default income category when category is Income kind', async () => {
    const dto = await updateIncomeUseCase.execute({ categoryId: 'cat-inc-1', userId: 'user-test-1' });

    expect(dto.defaultIncomeCategoryId).toBe('cat-inc-1');
  });

  it('should fail updating default income category if category is Expense kind', async () => {
    await expect(
      updateIncomeUseCase.execute({ categoryId: 'cat-exp-1', userId: 'user-test-1' })
    ).rejects.toThrow();
  });
});
