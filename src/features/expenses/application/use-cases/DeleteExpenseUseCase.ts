import { IExpenseRepository } from '../repositories';
import { ExpenseId } from '../../domain';
import { DeleteExpenseRequest } from './DeleteExpenseRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchExpenseOrError } from './UseCaseHelpers';

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {
    Object.freeze(this);
  }

  public async execute(request: DeleteExpenseRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const expenseId = new ExpenseId(request.id);

      const fetchResult = await fetchExpenseOrError(this.expenseRepository, expenseId);
      if (!fetchResult.success) {
        return fetchResult;
      }

      return await this.expenseRepository.delete(expenseId);
    });
  }
}
