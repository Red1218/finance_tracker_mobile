import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreCategoryUseCase } from '../use-cases/RestoreCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';

describe('RestoreCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: RestoreCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new RestoreCategoryUseCase(repository);

    repository.seed(
      new Category({
        id: new CategoryId('cat-archived'),
        name: new CategoryName('Old Utilities'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: new Date(),
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-active'),
        name: new CategoryName('Active Rent'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );
  });

  it('successfully restores an archived category setting archivedAt to null', async () => {
    await useCase.execute({ id: 'cat-archived' });

    const res = await repository.getById(new CategoryId('cat-archived'));
    if (res.success && res.data) {
      expect(res.data.isArchived).toBe(false);
      expect(res.data.archivedAt).toBeNull();
    }
  });

  it('rejects restoring a non-archived category (CATEGORY_NOT_ARCHIVED)', async () => {
    await expect(useCase.execute({ id: 'cat-active' })).rejects.toThrowError(
      'Category is not archived.'
    );
  });

  it('rejects restoring if category does not exist (CATEGORY_NOT_FOUND)', async () => {
    await expect(useCase.execute({ id: 'cat-nonexistent' })).rejects.toThrowError(
      'Category "cat-nonexistent" not found.'
    );
  });
});
