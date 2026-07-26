import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget } from '../../domain';

export interface ListBudgetsQuery {
  includeArchived?: boolean;
  categoryId?: string | null;
}

export class ListBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(query?: ListBudgetsQuery): Promise<Budget[]> {
    const result = await this.budgetRepository.list(
      query?.includeArchived ?? false,
      query?.categoryId
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }
}
