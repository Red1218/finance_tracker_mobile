import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { BudgetId, BudgetDomainError } from '../../domain';

export interface RestoreBudgetCommand {
  id: string;
}

export class RestoreBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreBudgetCommand): Promise<void> {
    const budgetId = new BudgetId(command.id);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetDomainError('BUDGET_NOT_FOUND', `Budget "${command.id}" not found.`);
    }

    const budget = getResult.data;
    const restoredBudget = budget.restore();

    const saveResult = await this.budgetRepository.save(restoredBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
