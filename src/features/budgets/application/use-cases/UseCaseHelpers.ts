import { Result } from '../../../../platform/persistence';
import { Budget, BudgetId } from '../../domain';
import { BudgetDomainError } from '../../domain/errors';
import { IBudgetRepository } from '../repositories';
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

export async function fetchBudgetOrError(
  repository: IBudgetRepository,
  id: BudgetId
): Promise<UseCaseResult<Budget>> {
  const result = await repository.getById(id);
  
  if (!result.success) {
    return result;
  }
  
  if (!result.data) {
    return Result.failure(
      new BudgetDomainError('INVALID_IDENTIFIER', 'Budget not found.')
    );
  }
  
  return Result.success(result.data);
}
