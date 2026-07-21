import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId } from '../../domain';
import { RestoreCategoryRequest } from './RestoreCategoryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchCategoryOrError } from './UseCaseHelpers';

export class RestoreCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: RestoreCategoryRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.id);

      const categoryResult = await fetchCategoryOrError(this.categoryRepository, categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }

      // Domain enforces: restoring a non-archived category is a business rule violation.
      const restored = categoryResult.data.restore();

      return await this.categoryRepository.restore(restored.id);
    });
  }
}
