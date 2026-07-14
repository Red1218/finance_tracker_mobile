import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteCategoryUseCase } from '../use-cases/DeleteCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryType, CategoryDomainError } from '../../domain';

describe('DeleteCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  const seedCategory = (id: string, name: string, type: CategoryType = CategoryType.Custom) => {
    const category = new Category({
      id: new CategoryId(id),
      name: new CategoryName(name),
      type,
    });
    repository.seed(category);
  };

  it('should successfully delete a category', async () => {
    seedCategory('cat-1', 'Groceries');

    const result = await useCase.execute({ id: 'cat-1' });

    expect(result.success).toBe(true);

    const check = await repository.getById(new CategoryId('cat-1'));
    expect(check.success).toBe(true);
    if (check.success) {
      expect(check.data).toBeNull();
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

  it('should fail if category is protected (domain validation)', async () => {
    seedCategory('cat-protected', 'Transfer', CategoryType.Protected);

    const result = await useCase.execute({ id: 'cat-protected' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('PROTECTED_CATEGORY_MODIFICATION');
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
