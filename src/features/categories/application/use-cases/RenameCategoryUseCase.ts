import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId, CategoryName, CategoryDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';
import { RenameCategoryRequest } from './RenameCategoryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchCategoryOrError } from './UseCaseHelpers';

export class RenameCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: RenameCategoryRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.id);
      const newCategoryName = new CategoryName(request.newName);

      const categoryResult = await fetchCategoryOrError(this.categoryRepository, categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }
      const category = categoryResult.data;

      const existsResult = await this.categoryRepository.existsByName(newCategoryName);
      if (!existsResult.success) {
        return existsResult;
      }

      if (existsResult.data) {
        return Result.failure(
          new CategoryDomainError('INVALID_NAME', 'Category name already exists.')
        );
      }

      const updatedCategory = category.rename(newCategoryName);
      return await this.categoryRepository.update(updatedCategory);
    });
  }
}
