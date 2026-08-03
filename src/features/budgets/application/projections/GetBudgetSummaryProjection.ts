import { BudgetId } from '../../domain';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ITransactionRepository } from '../../../transactions/application/repositories/ITransactionRepository';
import { BudgetSummaryDTO } from '../dto/BudgetDTO';
import { BudgetDTOMapper } from '../mappers/BudgetDTOMapper';
import { BudgetNotFoundError } from '../errors/BudgetApplicationError';

export class GetBudgetSummaryProjection {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {
    Object.freeze(this);
  }

  public async execute(budgetId: string | any): Promise<BudgetSummaryDTO> {
    const rawBudgetId = typeof budgetId === 'object' && budgetId !== null ? (budgetId.value ?? budgetId.budgetId ?? budgetId.id) : budgetId;
    const bId = new BudgetId(rawBudgetId);
    const budgetResult = await this.budgetRepository.getById(bId);

    if (!budgetResult.success || !budgetResult.data) {
      throw new BudgetNotFoundError(rawBudgetId);
    }
    const budget = budgetResult.data;

    const txResult = await this.transactionRepository.listTransactions({
      startDate: budget.startDate,
      endDate: budget.endDate,
    });

    if (!txResult.success) {
      throw txResult.error;
    }

    const categoryIdVal = budget.categoryId ? budget.categoryId.value : null;

    const matchingTxList = txResult.data.filter((tx: any) => {
      const isExpenseType =
        (tx.type && typeof tx.type.isExpense === 'function' && tx.type.isExpense()) ||
        tx.type === 'EXPENSE' ||
        (tx.type && tx.type.kind === 'EXPENSE');

      if (!isExpenseType) return false;

      if (budget.isOverall) return true;

      const txCatId = tx.categoryId ? (typeof tx.categoryId === 'string' ? tx.categoryId : tx.categoryId.value) : null;
      return txCatId === categoryIdVal;
    });

    const spentAmount = matchingTxList.reduce((sum: number, tx: any) => {
      const val = typeof tx.amount?.value === 'number' ? tx.amount.value : (typeof tx.amount === 'number' ? tx.amount : 0);
      return sum + val;
    }, 0);

    const budgetAmount = budget.amount.value;
    const remainingAmount = budgetAmount - spentAmount;
    const percentageUsed = budgetAmount > 0 ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100)) : 0;

    let healthStatus: 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET' = 'ON_TRACK';
    if (spentAmount > budgetAmount) {
      healthStatus = 'OVER_BUDGET';
    } else if (percentageUsed >= 80) {
      healthStatus = 'NEAR_LIMIT';
    }

    return Object.freeze({
      budget: BudgetDTOMapper.toDTO(budget),
      spentAmount,
      remainingAmount,
      percentageUsed,
      healthStatus,
      budgetAmount,
      currency: budget.currencyCode ? budget.currencyCode.value : (budget.currency ? budget.currency.value : 'INR'),
    });
  }
}
