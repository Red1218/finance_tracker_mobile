import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreCategoryUseCase } from '../use-cases/RestoreCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryType, CategoryDomainError } from '../../domain';

describe('RestoreCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: RestoreCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new RestoreCategoryUseCase(repository);
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

  it('should successfully restore an archived category', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom, true);

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(true);

    const check = await repository.getById(new CategoryId('cat-1'));
    expect(check.success).toBe(true);
    if (check.success && check.data) {
      expect(check.data.isArchived).toBe(false);
    }
  });

  it('should appear in list() after restoring', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom, true);

    await useCase.execute({ id: 'cat-1' });

    const listResult = await repository.list();
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.find((c) => c.id.value === 'cat-1')).toBeDefined();
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

  it('should fail if category is not archived', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom, false);

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('CATEGORY_NOT_ARCHIVED');
    }
  });

  it('should propagate repository errors', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom, true);
    repository.setForceFailure('Database error');

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Database error');
    }
  });
});
