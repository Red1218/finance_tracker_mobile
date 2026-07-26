import { Budget } from '../../domain';
import { BudgetSummary } from '../../application';
import { BudgetViewModel } from '../models/BudgetViewModel';

export class BudgetViewModelMapper {
  public static toViewModel(budget: Budget, summary?: BudgetSummary): BudgetViewModel {
    return {
      id: budget.id.value,
      categoryId: budget.categoryId ? budget.categoryId.value : null,
      isOverall: budget.isOverall,
      amount: budget.amount.value,
      currency: budget.currency.value,
      periodKind: budget.period.kind,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      isArchived: budget.isArchived,
      archivedAt: budget.archivedAt ? budget.archivedAt.toISOString() : null,
      spentAmount: summary?.spentAmount,
      remainingAmount: summary?.remainingAmount,
      percentageUsed: summary?.percentageUsed,
      healthStatus: summary?.healthStatus,
    };
  }
}
