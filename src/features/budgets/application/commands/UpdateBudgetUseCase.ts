import { BudgetId, BudgetAmount } from '../../domain';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { UpdateBudgetCommand } from './UpdateBudgetCommand';
import { BudgetDTO } from '../dto/BudgetDTO';
import { BudgetDTOMapper } from '../mappers/BudgetDTOMapper';
import { BudgetNotFoundError } from '../errors/BudgetApplicationError';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateBudgetCommand, currentDate: Date = new Date()): Promise<BudgetDTO> {
    const targetId = command.budgetId || command.id;
    if (!targetId) {
      throw new BudgetNotFoundError('');
    }
    const budgetId = new BudgetId(targetId);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetNotFoundError(targetId);
    }

    const effectiveCurrentDate = command.currentDate ?? currentDate;
    const updatedBudget = getResult.data.updateAmount(new BudgetAmount(command.newAmount), effectiveCurrentDate);
    const saveResult = await this.budgetRepository.save(updatedBudget);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return BudgetDTOMapper.toDTO(updatedBudget);
  }
}
