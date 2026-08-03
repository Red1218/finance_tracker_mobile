import { BudgetId } from '../../domain';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ArchiveBudgetCommand } from './ArchiveBudgetCommand';
import { BudgetNotFoundError } from '../errors/BudgetApplicationError';

export class ArchiveBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: ArchiveBudgetCommand): Promise<void> {
    const rawId = command.budgetId || command.id;
    const targetId = typeof rawId === 'object' && rawId !== null ? (rawId as any).value ?? (rawId as any).id : rawId;
    if (!targetId) {
      throw new BudgetNotFoundError('');
    }
    const budgetId = new BudgetId(targetId);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetNotFoundError(targetId || '');
    }

    const archivedBudget = getResult.data.archive();
    const saveResult = await this.budgetRepository.save(archivedBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
