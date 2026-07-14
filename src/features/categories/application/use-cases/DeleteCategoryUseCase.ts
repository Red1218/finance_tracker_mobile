import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId } from '../../domain';
import { DeleteCategoryRequest } from './DeleteCategoryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchCategoryOrError } from './UseCaseHelpers';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: DeleteCategoryRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.id);

      const categoryResult = await fetchCategoryOrError(this.categoryRepository, categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }
      const category = categoryResult.data;

      category.validateDeletion();

      return await this.categoryRepository.delete(categoryId);
    });
  }
}
