import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget, BudgetId, BudgetAmount, BudgetDomainError } from '../../domain';

export interface UpdateBudgetCommand {
  id: string;
  newAmount: number;
  currentDate?: Date;
}

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateBudgetCommand): Promise<Budget> {
    const budgetId = new BudgetId(command.id);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetDomainError('BUDGET_NOT_FOUND', `Budget "${command.id}" not found.`);
    }

    const existingBudget = getResult.data;
    const updatedBudget = existingBudget.updateAmount(
      new BudgetAmount(command.newAmount),
      command.currentDate
    );

    const saveResult = await this.budgetRepository.save(updatedBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return updatedBudget;
  }
}
