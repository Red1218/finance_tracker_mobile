import { describe, it, expect, beforeEach } from 'vitest';
import { RenameCategoryUseCase } from '../use-cases/RenameCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind, CategoryDomainError } from '../../domain';

describe('RenameCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: RenameCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new RenameCategoryUseCase(repository);

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

  it('successfully renames a custom category', async () => {
    const updated = await useCase.execute({ id: 'cat-1', newName: 'Supermarket' });

    const res = await repository.getById(new CategoryId('cat-1'));
    if (res.success && res.data) {
      expect(res.data.name.value).toBe('Supermarket');
    }
  });

  it('rejects renaming system categories (SYSTEM_CATEGORY_MODIFICATION)', async () => {
    await expect(
      useCase.execute({ id: 'cat-sys', newName: 'Custom System Name' })
    ).rejects.toThrowError('System categories cannot be renamed.');
  });

  it('rejects renaming if category does not exist (CATEGORY_NOT_FOUND)', async () => {
    await expect(
      useCase.execute({ id: 'invalid-id', newName: 'New Name' })
    ).rejects.toThrowError('Category "invalid-id" not found.');
  });
});
