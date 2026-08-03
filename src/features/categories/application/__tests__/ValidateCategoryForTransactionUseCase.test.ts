import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryValidationService } from '../services/CategoryValidationService';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';
import { CategoryNotFoundError, CategoryMismatchError } from '../errors/CategoryApplicationError';

describe('CategoryValidationService', () => {
  let repository: InMemoryCategoryRepository;
  let service: CategoryValidationService;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();

    const catExpense = new Category({
      id: new CategoryId('cat-expense'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: true,
    });

    repository.seed(catExpense);
    service = new CategoryValidationService(repository);
  });

  it('should pass validation when category matches expected kind', async () => {
    await expect(service.validateCategoryForKind('cat-expense', 'EXPENSE')).resolves.toBeUndefined();
  });

  it('should throw CategoryMismatchError when category kind differs', async () => {
    await expect(service.validateCategoryForKind('cat-expense', 'INCOME')).rejects.toThrow(CategoryMismatchError);
  });

  it('should throw CategoryNotFoundError when category missing', async () => {
    await expect(service.validateCategoryForKind('cat-missing', 'EXPENSE')).rejects.toThrow(CategoryNotFoundError);
  });
});
