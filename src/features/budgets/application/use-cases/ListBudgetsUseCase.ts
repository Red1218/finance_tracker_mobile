import { IBudgetRepository, BudgetFilter } from '../repositories';
import { Budget, BudgetPeriod, BudgetStatus } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { ListBudgetsRequest } from './ListBudgetsRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';

export class ListBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: ListBudgetsRequest): Promise<UseCaseResult<Budget[]>> {
    return executeUseCase(async () => {
      const filter: BudgetFilter = {
        period: request.period ? new BudgetPeriod(request.period) : undefined,
        categoryId: request.categoryId ? new CategoryId(request.categoryId) : undefined,
        status: request.status ? new BudgetStatus(request.status) : undefined,
        includeDeleted: request.includeDeleted,
      };

      if (request.categoryId === null) {
        filter.categoryId = null;
      }

      return await this.budgetRepository.list(filter);
    });
  }
}
