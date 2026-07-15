import { IBudgetRepository } from '../repositories';
import { BudgetId, BudgetAmount, BudgetStatus } from '../../domain';
import { CurrencyCode, SupportedCurrency } from '../../../expenses/domain/value-objects/CurrencyCode';
import { UpdateBudgetRequest } from './UpdateBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchBudgetOrError } from './UseCaseHelpers';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: UpdateBudgetRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(request.id);
      
      const fetchResult = await fetchBudgetOrError(this.budgetRepository, budgetId);
      if (!fetchResult.success) {
        return fetchResult;
      }
      
      const budget = fetchResult.data!;
      
      const updateProps: Parameters<typeof budget.update>[0] = {};
      
      if (request.amount !== undefined) {
        updateProps.amount = new BudgetAmount(request.amount);
      }
      if (request.status !== undefined) {
        updateProps.status = new BudgetStatus(request.status);
      }
      if (request.currency !== undefined) {
        updateProps.currency = new CurrencyCode(request.currency as SupportedCurrency);
      }
      if ('deletedAt' in request) {
        updateProps.deletedAt = request.deletedAt;
      }

      const updatedBudget = budget.update(updateProps);
      
      return await this.budgetRepository.update(updatedBudget);
    });
  }
}
