import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCategoryUseCase } from '../use-cases/CreateCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { CategoryKind, CategoryDomainError } from '../../domain';

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('successfully creates a category with isSystem = false and archivedAt = null', async () => {
    const category = await useCase.execute({
      name: 'Groceries',
      kind: CategoryKind.Expense,
      colorHex: '#EF4444',
      iconName: 'cart',
    });

    expect(category.name.value).toBe('Groceries');
    expect(category.kind).toBe(CategoryKind.Expense);
    expect(category.isSystem).toBe(false);
    expect(category.isArchived).toBe(false);
    expect(category.colorHex).toBe('#EF4444');

    const res = await repository.getAll();
    if (res.success) {
      expect(res.data).toHaveLength(1);
    }
  });

  it('rejects duplicate category name within the same kind (DUPLICATE_CATEGORY_NAME)', async () => {
    await useCase.execute({ name: 'Investments', kind: CategoryKind.Income });

    await expect(
      useCase.execute({ name: 'Investments', kind: CategoryKind.Income })
    ).rejects.toThrowError(CategoryDomainError);
  });

  it('allows same name across different CategoryKinds (Income vs Expense)', async () => {
    const expenseCat = await useCase.execute({ name: 'Refund', kind: CategoryKind.Expense });
    const incomeCat = await useCase.execute({ name: 'Refund', kind: CategoryKind.Income });

    expect(expenseCat.kind).toBe(CategoryKind.Expense);
    expect(incomeCat.kind).toBe(CategoryKind.Income);

    const res = await repository.getAll();
    if (res.success) {
      expect(res.data).toHaveLength(2);
    }
  });

  it('propagates repository errors', async () => {
    repository.setForceFailure('Database insert error');

    await expect(
      useCase.execute({ name: 'Groceries', kind: CategoryKind.Expense })
    ).rejects.toThrowError('Database insert error');
  });
});
