import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { BudgetDTO } from '../dto/BudgetDTO';
import { BudgetDTOMapper } from '../mappers/BudgetDTOMapper';

export class ListBudgetsQueryUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(includeArchivedOrQuery?: boolean | { includeArchived?: boolean }): Promise<BudgetDTO[]> {
    const includeArchived = typeof includeArchivedOrQuery === 'object'
      ? includeArchivedOrQuery?.includeArchived ?? false
      : includeArchivedOrQuery ?? false;

    const result = typeof (this.budgetRepository as any).getAll === 'function'
      ? await (this.budgetRepository as any).getAll(includeArchived)
      : await this.budgetRepository.list(includeArchived);

    if (!result.success) {
      throw result.error;
    }
    return result.data.map((budget: any) => BudgetDTOMapper.toDTO(budget));
  }
}
