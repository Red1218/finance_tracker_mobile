import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { GetBudgetSummaryRequest } from '../requests/GetBudgetSummaryRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { BudgetId, BudgetDomainError } from '../../domain';
import { BudgetSummaryResponse } from '../responses/BudgetSummaryResponse';
import { Result } from '../../../../platform/persistence';

export class GetBudgetSummaryUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: GetBudgetSummaryRequest): Promise<UseCaseResult<BudgetSummaryResponse>> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(request.id);
      
      const summaryResult = await this.budgetRepository.getBudgetSummary(budgetId);
      if (!summaryResult.success) return summaryResult;
      
      if (!summaryResult.data) {
        return Result.failure(new BudgetDomainError('INVALID_IDENTIFIER', 'Budget not found for summary.'));
      }

      const { budget, spentAmount } = summaryResult.data;
      const amountValue = budget.amount.value;

      const remainingAmount = amountValue - spentAmount;
      const percentageUsed = amountValue > 0 ? (spentAmount / amountValue) * 100 : 0;
      
      let status: 'OnTrack' | 'AtRisk' | 'Overbudget' = 'OnTrack';
      if (percentageUsed >= 100) {
        status = 'Overbudget';
      } else if (percentageUsed >= 80) {
        status = 'AtRisk';
      }

      const response: BudgetSummaryResponse = {
        budget,
        spentAmount,
        remainingAmount,
        percentageUsed,
        status,
      };

      return Result.success(response);
    });
  }
}
