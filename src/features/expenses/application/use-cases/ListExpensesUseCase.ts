import { IExpenseRepository } from '../repositories';
import { Expense } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { ListExpensesRequest } from './ListExpensesRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';

export class ListExpensesUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {
    Object.freeze(this);
  }

  public async execute(request: ListExpensesRequest = {}): Promise<UseCaseResult<Expense[]>> {
    return executeUseCase(async () => {
      const filter = {
        categoryId: request.categoryId ? new CategoryId(request.categoryId) : undefined,
        startDate: request.startDate,
        endDate: request.endDate,
        paymentMethod: request.paymentMethod,
      };

      return await this.expenseRepository.list(filter, request.limit, request.offset);
    });
  }
}
