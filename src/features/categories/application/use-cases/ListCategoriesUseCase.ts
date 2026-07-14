import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../../domain';
import { ListCategoriesRequest } from './ListCategoriesRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(request: ListCategoriesRequest): Promise<UseCaseResult<Category[]>> {
    return executeUseCase(async () => {
      return await this.categoryRepository.list();
    });
  }
}
