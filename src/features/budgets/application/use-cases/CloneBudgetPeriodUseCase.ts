import { IBudgetRepository } from '../repositories';
import { Budget, BudgetId, BudgetPeriod, BudgetStatus } from '../../domain';
import { CloneBudgetPeriodRequest } from './CloneBudgetPeriodRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';
import { CreateBudgetUseCase } from './CreateBudgetUseCase';

export class CloneBudgetPeriodUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: CloneBudgetPeriodRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const sourcePeriod = request.sourcePeriod;
      
      const sourceBudgetsResult = await this.budgetRepository.list({
        period: new BudgetPeriod(sourcePeriod),
        status: new BudgetStatus('Active'),
        includeDeleted: false
      });
      
      if (!sourceBudgetsResult.success) {
        return sourceBudgetsResult;
      }
      
      const createUseCase = new CreateBudgetUseCase(this.budgetRepository);
      
      for (const budget of sourceBudgetsResult.data!) {
        const createRequest = {
          categoryId: budget.categoryId?.value,
          amount: budget.amount.value,
          currency: budget.currency.value,
          period: request.targetPeriod,
        };
        
        const createResult = await createUseCase.execute(createRequest);
        if (!createResult.success) {
          const errorCode = (createResult.error as any).code;
          if (errorCode === 'DUPLICATE_BUDGET') {
            continue; // skip budgets that already exist
          }
          return createResult;
        }
      }
      
      return Result.success(undefined);
    });
  }
}
