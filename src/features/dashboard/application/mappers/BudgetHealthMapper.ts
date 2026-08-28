import { BudgetHealthStatus } from '../../domain/value-objects/BudgetHealthStatus';
import { BudgetHealthViewModel, BudgetHealthRow } from '../view-models/BudgetHealthViewModel';

export class BudgetHealthMapper {
  static mapToViewModel(
    healthStatuses: BudgetHealthStatus[],
    categoriesMap?: Record<string, string>
  ): BudgetHealthViewModel {
    if (healthStatuses.length === 0) {
      return this.mapEmpty();
    }

    const rows: BudgetHealthRow[] = healthStatuses.map(status => {
      const isOverall =
        status.categoryId === undefined ||
        status.categoryId === null ||
        status.budgetId === 'overall' ||
        status.budgetId === 'global';

      const catName = isOverall
        ? 'Overall'
        : status.categoryId && categoriesMap
          ? categoriesMap[status.categoryId]
          : status.budgetId && categoriesMap
            ? categoriesMap[status.budgetId]
            : undefined;

      return {
        statusLabel: status.status,
        amountConsumed: status.amountConsumed.format(),
        budgetLimit: status.limit.format(),
        remainingAmount: status.remainingAmount ? status.remainingAmount.format() : undefined,
        consumptionRatio: status.consumptionRatio,
        categoryId: status.categoryId,
        categoryName: catName,
        isOverall,
      };
    });

    return {
      sectionType: 'BudgetHealth',
      status: 'Loaded',
      isLoading: false,
      isEmpty: false,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: rows
    };
  }

  static mapEmpty(): BudgetHealthViewModel {
    return {
      sectionType: 'BudgetHealth',
      status: 'Empty',
      isLoading: false,
      isEmpty: true,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: null
    };
  }

  static mapError(error: Error, retryToken: string): BudgetHealthViewModel {
    return {
      sectionType: 'BudgetHealth',
      status: 'Error',
      isLoading: false,
      isEmpty: false,
      error: error.message,
      retryToken,
      lastUpdated: new Date(),
      content: null
    };
  }
}
