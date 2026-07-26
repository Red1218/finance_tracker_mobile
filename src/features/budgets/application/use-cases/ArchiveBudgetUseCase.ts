import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { BudgetId, BudgetDomainError } from '../../domain';

export interface ArchiveBudgetCommand {
  id: string;
  archivedAt?: Date;
}

export class ArchiveBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: ArchiveBudgetCommand): Promise<void> {
    const budgetId = new BudgetId(command.id);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetDomainError('BUDGET_NOT_FOUND', `Budget "${command.id}" not found.`);
    }

    const budget = getResult.data;
    const archivedBudget = budget.archive(command.archivedAt);

    const saveResult = await this.budgetRepository.save(archivedBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
