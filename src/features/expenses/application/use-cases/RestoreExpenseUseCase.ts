import { IExpenseRepository } from '../repositories';
import { ExpenseId, ExpenseDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchExpenseOrError } from './UseCaseHelpers';

export interface RestoreExpenseRequest {
  id: string;
}

export class RestoreExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {
    Object.freeze(this);
  }

  public async execute(request: RestoreExpenseRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const expenseId = new ExpenseId(request.id);

      const fetchResult = await fetchExpenseOrError(this.expenseRepository, expenseId);
      if (!fetchResult.success) {
        return fetchResult;
      }

      const expense = fetchResult.data!;

      try {
        const restoredExpense = expense.restore();
        return await this.expenseRepository.restore(restoredExpense.id);
      } catch (e) {
        return Result.failure(
          new ExpenseDomainError(
            'EXPENSE_NOT_DELETED',
            'Cannot restore an expense that is not deleted.'
          )
        );
      }
    });
  }
}
