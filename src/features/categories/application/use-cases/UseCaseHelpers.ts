import { Result } from '../../../../platform/persistence';
import { Category, CategoryId, CategoryDomainError } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { UseCaseResult } from './UseCaseTypes';

export async function executeUseCase<T>(
  action: () => Promise<UseCaseResult<T>>
): Promise<UseCaseResult<T>> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure(error);
    }
    return Result.failure(new Error('Unknown application error'));
  }
}

export async function fetchCategoryOrError(
  repository: ICategoryRepository,
  id: CategoryId
): Promise<UseCaseResult<Category>> {
  const result = await repository.getById(id);
  
  if (!result.success) {
    return result;
  }
  
  if (!result.data) {
    return Result.failure(
      new CategoryDomainError('INVALID_IDENTIFIER', 'Category not found.')
    );
  }
  
  return Result.success(result.data);
}
