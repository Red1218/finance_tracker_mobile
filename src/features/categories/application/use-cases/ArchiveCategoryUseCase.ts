import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId } from '../../domain';
import { ArchiveCategoryRequest } from './ArchiveCategoryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchCategoryOrError } from './UseCaseHelpers';

export class ArchiveCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: ArchiveCategoryRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.id);

      const categoryResult = await fetchCategoryOrError(this.categoryRepository, categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }

      // Domain enforces: protected categories cannot be archived,
      // and double-archiving is a business rule violation.
      const archived = categoryResult.data.archive();

      return await this.categoryRepository.archive(archived.id);
    });
  }
}
