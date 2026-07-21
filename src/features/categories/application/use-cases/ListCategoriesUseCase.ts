import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../../domain';
import { ListCategoriesRequest } from './ListCategoriesRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { Result } from '../../core/Result';
import { ApplicationError } from '../../core/ApplicationError';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request?: ListCategoriesRequest): Promise<UseCaseResult<Category[]>> {
    return executeUseCase(async () => {
      const includeArchived = request?.includeArchived ?? false;
      return await this.categoryRepository.list(includeArchived);
    });
  }
}
