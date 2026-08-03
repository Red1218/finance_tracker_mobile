import { describe, it, expect, beforeEach } from 'vitest';
import { ListCategoriesQueryUseCase } from '../queries/ListCategoriesQueryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';

describe('ListCategoriesQueryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ListCategoriesQueryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();

    const cat1 = new Category({
      id: new CategoryId('cat-exp'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: true,
    });

    const cat2 = new Category({
      id: new CategoryId('cat-inc'),
      name: new CategoryName('Salary'),
      kind: CategoryKind.Income,
      isSystem: true,
    });

    repository.seed(cat1);
    repository.seed(cat2);

    useCase = new ListCategoriesQueryUseCase(repository);
  });

  it('should list all active categories by default', async () => {
    const list = await useCase.execute();
    expect(list.length).toBe(2);
  });

  it('should filter categories by kind', async () => {
    const list = await useCase.execute('EXPENSE');
    expect(list.length).toBe(1);
    expect(list[0].kind).toBe('EXPENSE');
  });
});
