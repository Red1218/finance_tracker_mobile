import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryId, CategoryKind, CategoryDomainError } from '../../domain';

export interface ValidateCategoryCommand {
  categoryId: string;
  expectedKind: CategoryKind;
}

export class ValidateCategoryForTransactionUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: ValidateCategoryCommand): Promise<Category> {
    const catId = new CategoryId(command.categoryId);
    const result = await this.categoryRepository.getById(catId);

    if (!result.success || !result.data) {
      throw new CategoryDomainError('CATEGORY_NOT_FOUND', `Category "${command.categoryId}" not found.`);
    }

    const category = result.data;

    if (category.isArchived) {
      throw new CategoryDomainError(
        'ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED',
        `Cannot assign archived category "${category.name.value}" to a transaction.`
      );
    }

    if (category.kind !== command.expectedKind) {
      throw new CategoryDomainError(
        'INVALID_IDENTIFIER',
        `Category "${category.name.value}" kind (${category.kind}) does not match expected transaction flow (${command.expectedKind}).`
      );
    }

    return category;
  }
}
