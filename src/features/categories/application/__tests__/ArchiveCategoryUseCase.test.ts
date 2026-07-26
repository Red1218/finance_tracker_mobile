import { describe, it, expect, beforeEach } from 'vitest';
import { ArchiveCategoryUseCase } from '../use-cases/ArchiveCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind, CategoryDomainError } from '../../domain';

describe('ArchiveCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ArchiveCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ArchiveCategoryUseCase(repository);

    repository.seed(
      new Category({
        id: new CategoryId('cat-1'),
        name: new CategoryName('Groceries'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-sys'),
        name: new CategoryName('Uncategorized Expense'),
        kind: CategoryKind.Expense,
        isSystem: true,
        archivedAt: null,
      })
    );
  });

  it('successfully archives a user category setting archivedAt', async () => {
    const freezeTime = new Date('2026-07-25T14:00:00.000Z');
    await useCase.execute({ id: 'cat-1', archivedAt: freezeTime });

    const res = await repository.getById(new CategoryId('cat-1'));
    if (res.success && res.data) {
      expect(res.data.isArchived).toBe(true);
      expect(res.data.archivedAt).toEqual(freezeTime);
    }
  });

  it('rejects archiving a system category (SYSTEM_CATEGORY_MODIFICATION)', async () => {
    await expect(useCase.execute({ id: 'cat-sys' })).rejects.toThrowError(
      'System categories cannot be archived.'
    );
  });

  it('rejects archiving an already archived category (CATEGORY_ALREADY_ARCHIVED)', async () => {
    await useCase.execute({ id: 'cat-1' });
    await expect(useCase.execute({ id: 'cat-1' })).rejects.toThrowError(
      'Category is already archived.'
    );
  });

  it('rejects archiving if category does not exist (CATEGORY_NOT_FOUND)', async () => {
    await expect(useCase.execute({ id: 'cat-missing' })).rejects.toThrowError(
      'Category "cat-missing" not found.'
    );
  });
});
