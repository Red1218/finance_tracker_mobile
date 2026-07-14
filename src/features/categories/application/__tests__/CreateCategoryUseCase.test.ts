import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCategoryUseCase } from '../use-cases/CreateCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { CategoryType, CategoryDomainError } from '../../domain';

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should successfully create a category', async () => {
    const result = await useCase.execute({
      name: 'Groceries',
      type: CategoryType.Custom,
    });

    expect(result.success).toBe(true);

    const savedResult = await repository.list();
    expect(savedResult.success).toBe(true);
    if (savedResult.success) {
      expect(savedResult.data).toHaveLength(1);
      expect(savedResult.data[0].name.value).toBe('Groceries');
      expect(savedResult.data[0].type).toBe(CategoryType.Custom);
    }
  });

  it('should fail if category name already exists', async () => {
    await useCase.execute({
      name: 'Groceries',
      type: CategoryType.Custom,
    });

    const result = await useCase.execute({
      name: 'Groceries',
      type: CategoryType.Custom,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CategoryDomainError);
      expect((result.error as CategoryDomainError).code).toBe('INVALID_NAME');
    }
  });

  it('should propagate repository errors (e.g. database failure)', async () => {
    repository.setForceFailure('Database error');

    const result = await useCase.execute({
      name: 'Groceries',
      type: CategoryType.Custom,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Database error');
    }
  });
});
