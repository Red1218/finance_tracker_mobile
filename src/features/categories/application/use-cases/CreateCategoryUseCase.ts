import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryId, CategoryName, CategoryDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';
import { CreateCategoryRequest } from './CreateCategoryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: CreateCategoryRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.id);
      const categoryName = new CategoryName(request.name);

      const existsResult = await this.categoryRepository.existsByName(categoryName);
      if (!existsResult.success) {
        return existsResult;
      }

      if (existsResult.data) {
        return Result.failure(
          new CategoryDomainError('INVALID_NAME', 'Category name already exists.')
        );
      }

      const category = new Category({
        id: categoryId,
        name: categoryName,
        type: request.type,
      });

      return await this.categoryRepository.create(category);
    });
  }
}
