import { CategoryId, CategoryKind } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryNotFoundError, CategoryMismatchError } from '../errors/CategoryApplicationError';

export class CategoryValidationService {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(
    categoryId: string | null | { categoryId?: string | null; expectedKind?: 'EXPENSE' | 'INCOME' },
    expectedKind?: 'EXPENSE' | 'INCOME'
  ): Promise<void> {
    if (categoryId && typeof categoryId === 'object' && 'categoryId' in categoryId) {
      return this.validateCategoryForKind(categoryId.categoryId ?? null, categoryId.expectedKind ?? 'EXPENSE');
    }
    return this.validateCategoryForKind(categoryId as string | null, expectedKind ?? 'EXPENSE');
  }

  public async validateCategoryForKind(
    categoryId: string | null,
    expectedKind: 'EXPENSE' | 'INCOME'
  ): Promise<void> {
    if (!categoryId) return;

    const result = await this.categoryRepository.getById(new CategoryId(categoryId));
    if (!result.success || !result.data) {
      throw new CategoryNotFoundError(categoryId);
    }

    const category = result.data;
    if (category.isArchived) {
      throw new CategoryMismatchError('ACTIVE_CATEGORY_REQUIRED', `Cannot assign archived category "${category.name.value}" to a transaction.`);
    }

    const expKind = expectedKind === 'EXPENSE' ? CategoryKind.Expense : CategoryKind.Income;
    if (category.kind !== expKind) {
      throw new CategoryMismatchError(expectedKind, category.kind);
    }
  }
}
