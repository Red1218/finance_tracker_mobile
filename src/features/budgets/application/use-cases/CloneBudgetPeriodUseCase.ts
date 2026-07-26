import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { Budget, BudgetPeriodType } from '../../domain';
import { CreateBudgetUseCase } from './CreateBudgetUseCase';

export interface CloneBudgetPeriodCommand {
  targetPeriodKind: BudgetPeriodType;
  targetStartDate: Date;
  targetEndDate: Date;
}

export class CloneBudgetPeriodUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(command: CloneBudgetPeriodCommand): Promise<Budget[]> {
    const listResult = await this.budgetRepository.list(false);
    if (!listResult.success) {
      throw listResult.error;
    }

    const activeBudgets = listResult.data;
    const createUseCase = new CreateBudgetUseCase(this.budgetRepository, this.categoryRepository);
    const createdBudgets: Budget[] = [];

    for (const b of activeBudgets) {
      try {
        const cloned = await createUseCase.execute({
          categoryId: b.categoryId?.value ?? null,
          amount: b.amount.value,
          currencyCode: b.currency.value,
          periodKind: command.targetPeriodKind,
          startDate: command.targetStartDate,
          endDate: command.targetEndDate,
        });
        createdBudgets.push(cloned);
      } catch (e: any) {
        if (e?.code === 'OVERLAPPING_BUDGET') {
          continue; // skip budgets that overlap in target period
        }
        throw e;
      }
    }

    return createdBudgets;
  }
}
