import { Result } from '../../../../platform/persistence';
import { Expense, ExpenseId } from '../../domain';
import { ExpenseDomainError } from '../../domain/errors';
import { IExpenseRepository } from '../repositories';
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

export async function fetchExpenseOrError(
  repository: IExpenseRepository,
  id: ExpenseId
): Promise<UseCaseResult<Expense>> {
  const result = await repository.getById(id);
  
  if (!result.success) {
    return result;
  }
  
  if (!result.data) {
    return Result.failure(
      new ExpenseDomainError('INVALID_IDENTIFIER', 'Expense not found.')
    );
  }
  
  return Result.success(result.data);
}
