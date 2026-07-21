import { describe, it, expect, beforeEach } from 'vitest';
import { ArchiveCategoryUseCase } from '../use-cases/ArchiveCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryType, CategoryDomainError } from '../../domain';

describe('ArchiveCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ArchiveCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ArchiveCategoryUseCase(repository);
  });

  const seedCategory = (id: string, name: string, type: CategoryType = CategoryType.Custom, isArchived = false) => {
    const category = new Category({
      id: new CategoryId(id),
      name: new CategoryName(name),
      type,
      isArchived,
    });
    repository.seed(category);
  };

  it('should successfully archive a custom category', async () => {
    seedCategory('cat-1', 'Groceries');

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(true);

    const check = await repository.getById(new CategoryId('cat-1'));
    expect(check.success).toBe(true);
    if (check.success && check.data) {
      expect(check.data.isArchived).toBe(true);
    }
  });

  it('should not appear in list() after archiving', async () => {
    seedCategory('cat-1', 'Groceries');

    await useCase.execute({ id: 'cat-1' });

    const listResult = await repository.list();
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.find((c) => c.id.value === 'cat-1')).toBeUndefined();
    }
  });

  it('should fail if category does not exist', async () => {
    const result = await useCase.execute({ id: 'invalid-id' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('INVALID_IDENTIFIER');
    }
  });

  it('should fail if category is protected', async () => {
    seedCategory('cat-protected', 'Transfer', CategoryType.Protected);

    const result = await useCase.execute({ id: 'cat-protected' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('PROTECTED_CATEGORY_MODIFICATION');
    }
  });

  it('should fail if category is already archived', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom, true);

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('CATEGORY_ALREADY_ARCHIVED');
    }
  });

  it('should propagate repository errors', async () => {
    seedCategory('cat-1', 'Groceries');
    repository.setForceFailure('Database error');

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Database error');
    }
  });
});
