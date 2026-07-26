import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ITransactionRepository } from '../../../transactions/application/repositories/ITransactionRepository';
import { BudgetId, BudgetDomainError } from '../../domain';
import { TransactionType, TransactionTypeKind } from '../../../transactions/domain';
import { BudgetSummary, BudgetHealthStatus } from '../dtos/BudgetSummary';

export interface GetBudgetSummaryQuery {
  budgetId: string;
}

export class GetBudgetSummaryUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {
    Object.freeze(this);
  }

  public async execute(query: GetBudgetSummaryQuery): Promise<BudgetSummary> {
    const budgetId = new BudgetId(query.budgetId);
    const getResult = await this.budgetRepository.getById(budgetId);

    if (!getResult.success || !getResult.data) {
      throw new BudgetDomainError('BUDGET_NOT_FOUND', `Budget "${query.budgetId}" not found.`);
    }

    const budget = getResult.data;

    // Fetch non-voided expense transactions for budget period
    const txResult = await this.transactionRepository.listTransactions({
      type: new TransactionType(TransactionTypeKind.Expense),
      startDate: budget.startDate,
      endDate: budget.endDate,
      includeVoided: false,
    });

    if (!txResult.success) {
      throw txResult.error;
    }

    let matchingTransactions = txResult.data;

    // If Category budget, filter by categoryId
    if (budget.categoryId !== null) {
      const catIdStr = budget.categoryId.value;
      matchingTransactions = matchingTransactions.filter((tx) => tx.categoryId === catIdStr);
    }

    const spentAmount = matchingTransactions.reduce((sum, tx) => sum + tx.amount.value, 0);
    const budgetAmount = budget.amount.value;
    const remainingAmount = budgetAmount - spentAmount;
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    let healthStatus: BudgetHealthStatus = 'ON_TRACK';
    if (percentageUsed > 100) {
      healthStatus = 'OVER_BUDGET';
    } else if (percentageUsed > 80) {
      healthStatus = 'NEAR_LIMIT';
    }

    return {
      budgetId: budget.id.value,
      categoryId: budget.categoryId ? budget.categoryId.value : null,
      isOverall: budget.isOverall,
      budgetAmount,
      currency: budget.currency.value,
      spentAmount,
      remainingAmount,
      percentageUsed,
      healthStatus,
      periodKind: budget.period.kind,
      startDate: budget.startDate,
      endDate: budget.endDate,
    };
  }
}
