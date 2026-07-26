import { describe, it, expect, beforeEach } from 'vitest';
import { ValidateCategoryForTransactionUseCase } from '../use-cases/ValidateCategoryForTransactionUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind, CategoryDomainError } from '../../domain';

describe('ValidateCategoryForTransactionUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ValidateCategoryForTransactionUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ValidateCategoryForTransactionUseCase(repository);

    repository.seed(
      new Category({
        id: new CategoryId('cat-food'),
        name: new CategoryName('Food & Dining'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-salary'),
        name: new CategoryName('Salary'),
        kind: CategoryKind.Income,
        isSystem: false,
        archivedAt: null,
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-archived'),
        name: new CategoryName('Old Subscriptions'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: new Date(),
      })
    );
  });

  it('validates and returns category when category exists, is active, and matches expected kind', async () => {
    const category = await useCase.execute({
      categoryId: 'cat-food',
      expectedKind: CategoryKind.Expense,
    });

    expect(category.id.value).toBe('cat-food');
    expect(category.name.value).toBe('Food & Dining');
  });

  it('rejects assignment when category is archived (ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED)', async () => {
    await expect(
      useCase.execute({
        categoryId: 'cat-archived',
        expectedKind: CategoryKind.Expense,
      })
    ).rejects.toThrowError(CategoryDomainError);

    try {
      await useCase.execute({
        categoryId: 'cat-archived',
        expectedKind: CategoryKind.Expense,
      });
    } catch (err: any) {
      expect(err.code).toBe('ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED');
    }
  });

  it('rejects assignment when category kind mismatches expected transaction flow', async () => {
    await expect(
      useCase.execute({
        categoryId: 'cat-salary',
        expectedKind: CategoryKind.Expense, // Income category passed for Expense transaction
      })
    ).rejects.toThrowError(CategoryDomainError);
  });

  it('rejects assignment when category does not exist (CATEGORY_NOT_FOUND)', async () => {
    await expect(
      useCase.execute({
        categoryId: 'cat-nonexistent',
        expectedKind: CategoryKind.Expense,
      })
    ).rejects.toThrowError('Category "cat-nonexistent" not found.');
  });
});
