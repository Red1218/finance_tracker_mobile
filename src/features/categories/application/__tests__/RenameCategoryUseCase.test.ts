import { describe, it, expect, beforeEach } from 'vitest';
import { RenameCategoryUseCase } from '../use-cases/RenameCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryType, CategoryDomainError } from '../../domain';

describe('RenameCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: RenameCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new RenameCategoryUseCase(repository);
  });

  const seedCategory = (id: string, name: string, type: CategoryType = CategoryType.Custom) => {
    const category = new Category({
      id: new CategoryId(id),
      name: new CategoryName(name),
      type,
      isArchived: false,
    });
    repository.seed(category);
  };

  it('should successfully rename a custom category', async () => {
    seedCategory('cat-1', 'Old Name');

    const result = await useCase.execute({
      id: 'cat-1',
      newName: 'New Name',
    });

    expect(result.success).toBe(true);

    const check = await repository.getById(new CategoryId('cat-1'));
    expect(check.success).toBe(true);
    if (check.success && check.data) {
      expect(check.data.name.value).toBe('New Name');
    }
  });

  it('should fail if category does not exist', async () => {
    const result = await useCase.execute({
      id: 'invalid-id',
      newName: 'New Name',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('INVALID_IDENTIFIER');
    }
  });

  it('should fail if category name is already taken by another category', async () => {
    seedCategory('cat-1', 'Groceries');
    seedCategory('cat-2', 'Dining');

    const result = await useCase.execute({
      id: 'cat-2',
      newName: 'Groceries',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('INVALID_NAME');
    }
  });

  it('should propagate repository errors', async () => {
    seedCategory('cat-1', 'Groceries');
    repository.setForceFailure('Database error');

    const result = await useCase.execute({
      id: 'cat-1',
      newName: 'Supermarket',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Database error');
    }
  });
});
