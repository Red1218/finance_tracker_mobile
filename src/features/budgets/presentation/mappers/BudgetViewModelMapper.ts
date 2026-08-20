import { Budget } from '../../domain';
import { BudgetDTO, BudgetSummaryDTO } from '../../application/dto/BudgetDTO';
import { BudgetViewModel } from '../models/BudgetViewModel';

export class BudgetViewModelMapper {
  public static toViewModel(budget: Budget | BudgetDTO, summary?: BudgetSummaryDTO): BudgetViewModel {
    const isDto = typeof budget.id === 'string' && 'currencyCode' in budget;

    const idStr = isDto ? (budget as BudgetDTO).id : (budget as Budget).id.value;
    const categoryIdStr = isDto
      ? (budget as BudgetDTO).categoryId
      : (budget as Budget).categoryId ? (budget as Budget).categoryId!.value : null;
    const isOverallBool = isDto ? (budget as BudgetDTO).isOverall : (budget as Budget).isOverall;
    const amountVal = isDto ? (budget as BudgetDTO).amount : (budget as Budget).amount.value;
    const currencyStr = isDto
      ? (budget as BudgetDTO).currencyCode
      : (budget as Budget).currency ? (budget as Budget).currency.value : (budget as Budget).currencyCode.value;
    const periodKindStr = isDto ? (budget as BudgetDTO).periodKind : (budget as Budget).period.kind;
    const startDateIso = isDto
      ? (budget as BudgetDTO).startDate
      : (budget as Budget).period ? (budget as Budget).period.startDate.toISOString() : new Date().toISOString();
    const endDateIso = isDto
      ? (budget as BudgetDTO).endDate
      : (budget as Budget).period ? (budget as Budget).period.endDate.toISOString() : new Date().toISOString();
    const isArchivedBool = isDto ? (budget as BudgetDTO).isArchived : (budget as Budget).isArchived;
    const archivedAtIso = isDto
      ? (budget as BudgetDTO).archivedAt
      : ((budget as Budget).archivedAt ? (budget as Budget).archivedAt!.toISOString() : null);

    return {
      id: idStr,
      categoryId: categoryIdStr,
      isOverall: isOverallBool,
      amount: amountVal,
      currency: currencyStr,
      periodKind: periodKindStr,
      startDate: startDateIso,
      endDate: endDateIso,
      isArchived: isArchivedBool,
      archivedAt: archivedAtIso,
      spentAmount: summary?.spentAmount,
      remainingAmount: summary?.remainingAmount,
      percentageUsed: summary?.percentageUsed,
      healthStatus: summary?.healthStatus,
    };
  }
}
