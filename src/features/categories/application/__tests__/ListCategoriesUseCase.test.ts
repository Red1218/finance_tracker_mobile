import { describe, it, expect, beforeEach } from 'vitest';
import { ListCategoriesUseCase } from '../use-cases/ListCategoriesUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';

describe('ListCategoriesUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ListCategoriesUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new ListCategoriesUseCase(repository);

    repository.seed(
      new Category({
        id: new CategoryId('cat-exp-1'),
        name: new CategoryName('Groceries'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-inc-1'),
        name: new CategoryName('Salary'),
        kind: CategoryKind.Income,
        isSystem: false,
        archivedAt: null,
      })
    );

    repository.seed(
      new Category({
        id: new CategoryId('cat-exp-archived'),
        name: new CategoryName('Old Subscriptions'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: new Date(),
      })
    );
  });

  it('lists active categories by default excluding archived categories', async () => {
    const list = await useCase.execute();

    expect(list).toHaveLength(2);
    expect(list.map((c) => c.id.value)).toEqual(['cat-exp-1', 'cat-inc-1']);
  });

  it('filters active categories by CategoryKind (Expense vs Income)', async () => {
    const expenses = await useCase.execute({ kind: CategoryKind.Expense });
    expect(expenses).toHaveLength(1);
    expect(expenses[0].id.value).toBe('cat-exp-1');

    const income = await useCase.execute({ kind: CategoryKind.Income });
    expect(income).toHaveLength(1);
    expect(income[0].id.value).toBe('cat-inc-1');
  });

  it('includes archived categories when includeArchived = true', async () => {
    const list = await useCase.execute({ includeArchived: true });

    expect(list).toHaveLength(3);
  });
});
