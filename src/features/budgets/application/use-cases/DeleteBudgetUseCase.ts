import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { BudgetId, BudgetDomainError } from '../../domain';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(id: string): Promise<void> {
    const budgetId = new BudgetId(id);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetDomainError('BUDGET_NOT_FOUND', `Budget "${id}" not found.`);
    }

    const archiveResult = await this.budgetRepository.archive(budgetId);
    if (!archiveResult.success) {
      throw archiveResult.error;
    }
  }
}
