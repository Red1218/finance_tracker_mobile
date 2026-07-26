import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateDefaultExpenseCategoryUseCase } from '../use-cases/UpdateDefaultExpenseCategoryUseCase';
import { UpdateDefaultIncomeCategoryUseCase } from '../use-cases/UpdateDefaultIncomeCategoryUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';
import { PreferencesDomainError } from '../../domain';

describe('UpdateDefaultCategory Use Cases', () => {
  let preferencesRepo: InMemoryPreferencesRepository;
  let categoryRepo: InMemoryCategoryRepository;
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

  beforeEach(() => {
    preferencesRepo = new InMemoryPreferencesRepository();
    categoryRepo = new InMemoryCategoryRepository();
    categoryRepo.seed(expenseCategory);
    categoryRepo.seed(incomeCategory);

    updateExpenseUseCase = new UpdateDefaultExpenseCategoryUseCase(preferencesRepo, categoryRepo);
    updateIncomeUseCase = new UpdateDefaultIncomeCategoryUseCase(preferencesRepo, categoryRepo);
  });

  it('should successfully update default expense category when category is Expense kind', async () => {
    const result = await updateExpenseUseCase.execute({ categoryId: 'cat-exp-1' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaults.defaultExpenseCategoryId?.value).toBe('cat-exp-1');
    }
  });

  it('should fail updating default expense category if category is Income kind', async () => {
    const result = await updateExpenseUseCase.execute({ categoryId: 'cat-inc-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(PreferencesDomainError);
      expect((result.error as PreferencesDomainError).code).toBe('INVALID_DEFAULT_CATEGORY');
    }
  });

  it('should successfully update default income category when category is Income kind', async () => {
    const result = await updateIncomeUseCase.execute({ categoryId: 'cat-inc-1' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaults.defaultIncomeCategoryId?.value).toBe('cat-inc-1');
    }
  });

  it('should fail updating default income category if category is Expense kind', async () => {
    const result = await updateIncomeUseCase.execute({ categoryId: 'cat-exp-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(PreferencesDomainError);
      expect((result.error as PreferencesDomainError).code).toBe('INVALID_DEFAULT_CATEGORY');
    }
  });
});
