import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ListBudgetsRequest } from '../requests/ListBudgetsRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { Budget } from '../../domain';

export class ListBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: ListBudgetsRequest): Promise<UseCaseResult<Budget[]>> {
    return executeUseCase(async () => {
      return await this.budgetRepository.list();
    });
  }
}
