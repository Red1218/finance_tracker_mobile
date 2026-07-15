import { IBudgetRepository } from '../repositories';
import { BudgetId } from '../../domain';
import { DeleteBudgetRequest } from './DeleteBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchBudgetOrError } from './UseCaseHelpers';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: DeleteBudgetRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(request.id);
      
      const fetchResult = await fetchBudgetOrError(this.budgetRepository, budgetId);
      if (!fetchResult.success) {
        return fetchResult;
      }
      
      const budget = fetchResult.data!;
      
      const updatedBudget = budget.update({ deletedAt: new Date() });
      
      return await this.budgetRepository.update(updatedBudget);
    });
  }
}
