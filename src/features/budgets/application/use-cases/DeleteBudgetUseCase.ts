import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { DeleteBudgetRequest } from '../requests/DeleteBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { BudgetId, BudgetDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: DeleteBudgetRequest): Promise<UseCaseResult<void>> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(request.id);
      
      const budgetResult = await this.budgetRepository.findById(budgetId);
      if (!budgetResult.success) return budgetResult;
      
      if (!budgetResult.data) {
        return Result.failure(new BudgetDomainError('INVALID_IDENTIFIER', 'Budget not found.'));
      }

      return await this.budgetRepository.delete(budgetId);
    });
  }
}
