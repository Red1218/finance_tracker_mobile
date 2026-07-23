import { IBudgetRepository } from '../repositories';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { Budget, BudgetPeriod } from '../../domain';
import { CloneBudgetPeriodRequest } from './CloneBudgetPeriodRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';
import { CreateBudgetUseCase } from './CreateBudgetUseCase';

export class CloneBudgetPeriodUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(request: CloneBudgetPeriodRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const sourcePeriod = request.sourcePeriod as BudgetPeriod;

      // list() takes no filter — retrieve all then filter in-memory.
      const allBudgetsResult = await this.budgetRepository.list();

      if (!allBudgetsResult.success) {
        return allBudgetsResult;
      }

      const sourceBudgets: Budget[] = allBudgetsResult.data.filter(
        (b) => b.period === sourcePeriod
      );

      const createUseCase = new CreateBudgetUseCase(this.budgetRepository, this.categoryRepository);

      for (const budget of sourceBudgets) {
        const createRequest = {
          categoryId: budget.categoryId?.value ?? null,
          amount: budget.amount.value,
          currencyCode: budget.currency.value,
          period: request.targetPeriod,
          startDate: budget.startDate,
          endDate: budget.endDate,
        };

        const createResult = await createUseCase.execute(createRequest);
        if (!createResult.success) {
          const errorCode = (createResult.error as any).code;
          if (errorCode === 'DUPLICATE_BUDGET') {
            continue; // skip budgets that already exist in the target period
          }
          return createResult;
        }
      }

      return Result.success(undefined);
    });
  }
}
