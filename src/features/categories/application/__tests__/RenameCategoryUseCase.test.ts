import { describe, it, expect, beforeEach } from 'vitest';
import { RenameCategoryUseCase } from '../commands/RenameCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';
import { CategoryNotFoundError } from '../errors/CategoryApplicationError';

describe('RenameCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: RenameCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    const cat = new Category({
      id: new CategoryId('cat-1'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: false,
    });
    repository.seed(cat);
    useCase = new RenameCategoryUseCase(repository);
  });

  it('should rename category returning CategoryDTO', async () => {
    const dto = await useCase.execute({
      categoryId: 'cat-1',
      newName: 'Food & Groceries',
    });

    expect(dto.name).toBe('Food & Groceries');
  });

  it('should throw CategoryNotFoundError if category missing', async () => {
    await expect(
      useCase.execute({ categoryId: 'missing', newName: 'New' })
    ).rejects.toThrow(CategoryNotFoundError);
  });
});
