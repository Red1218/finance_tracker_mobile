import { BudgetId } from '../../domain';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { BudgetDTO } from '../dto/BudgetDTO';
import { BudgetDTOMapper } from '../mappers/BudgetDTOMapper';
import { BudgetNotFoundError } from '../errors/BudgetApplicationError';
import { RestoreBudgetCommand } from './RestoreBudgetCommand';

export class RestoreBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreBudgetCommand): Promise<BudgetDTO> {
    const rawId = command.budgetId || command.id;
    const targetId = typeof rawId === 'object' && rawId !== null ? (rawId as any).value ?? (rawId as any).id : rawId;
    if (!targetId) {
      throw new BudgetNotFoundError('');
    }
    const budgetId = new BudgetId(targetId);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetNotFoundError(targetId);
    }

    const restoredBudget = getResult.data.restore();
    const saveResult = await this.budgetRepository.save(restoredBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return BudgetDTOMapper.toDTO(restoredBudget);
  }
}
