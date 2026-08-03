import { Budget } from '../../domain';
import { BudgetDTO } from '../dto/BudgetDTO';

export class BudgetDTOMapper {
  public static toDTO(budget: Budget): BudgetDTO {
    return Object.freeze({
      id: budget.id.value,
      categoryId: budget.categoryId ? budget.categoryId.value : null,
      amount: budget.amount.value,
      currencyCode: budget.currencyCode.value,
      periodKind: budget.period.kind,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      isArchived: budget.isArchived,
      isOverall: budget.isOverall,
      archivedAt: budget.archivedAt ? budget.archivedAt.toISOString() : null,
    });
  }
}
