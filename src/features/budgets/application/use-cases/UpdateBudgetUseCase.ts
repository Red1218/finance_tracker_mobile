import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { UpdateBudgetRequest } from '../requests/UpdateBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { BudgetId, BudgetAmount, BudgetDomainError, Budget } from '../../domain';
import { Result } from '../../../../platform/persistence';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: UpdateBudgetRequest): Promise<UseCaseResult<Budget>> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(request.id);
      
      const budgetResult = await this.budgetRepository.findById(budgetId);
      if (!budgetResult.success) return budgetResult;
      
      const existingBudget = budgetResult.data;
      if (!existingBudget) {
        return Result.failure(new BudgetDomainError('INVALID_IDENTIFIER', 'Budget not found.'));
      }

      const updatedBudget = existingBudget.updateAmount(new BudgetAmount(request.amount));

      const updateResult = await this.budgetRepository.update(updatedBudget);
      if (!updateResult.success) {
        return updateResult;
      }

      return Result.success(updatedBudget);
    });
  }
}
