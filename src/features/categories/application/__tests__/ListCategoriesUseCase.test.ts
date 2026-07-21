import { describe, it, expect, beforeEach } from 'vitest';
import { ListCategoriesUseCase } from '../use-cases/ListCategoriesUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryType } from '../../domain';

describe('ListCategoriesUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ListCategoriesUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ListCategoriesUseCase(repository);
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

  it('should successfully list all categories', async () => {
    seedCategory('cat-1', 'Groceries', CategoryType.Custom);
    seedCategory('cat-2', 'Dining', CategoryType.Custom);
    seedCategory('cat-3', 'Transfer', CategoryType.Protected);

    const result = await useCase.execute({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
      const names = result.data.map(c => c.name.value);
      expect(names).toContain('Groceries');
      expect(names).toContain('Dining');
      expect(names).toContain('Transfer');
    }
  });

  it('should return empty array if no categories exist', async () => {
    const result = await useCase.execute({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it('should exclude archived categories from results', async () => {
    seedCategory('cat-active', 'Groceries', CategoryType.Custom, false);
    seedCategory('cat-archived', 'Old Category', CategoryType.Custom, true);

    const result = await useCase.execute({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id.value).toBe('cat-active');
    }
  });

  it('should propagate repository errors', async () => {
    repository.setForceFailure('Database error');

    const result = await useCase.execute({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Database error');
    }
  });
});
