import { BudgetHealthStatus } from '../../domain/value-objects/BudgetHealthStatus';
import { BudgetHealthViewModel, BudgetHealthRow } from '../view-models/BudgetHealthViewModel';

export class BudgetHealthMapper {
  static mapToViewModel(healthStatuses: BudgetHealthStatus[]): BudgetHealthViewModel {
    if (healthStatuses.length === 0) {
      return this.mapEmpty();
    }

    const rows: BudgetHealthRow[] = healthStatuses.map(status => ({
      statusLabel: status.status,
      amountConsumed: status.amountConsumed.format(),
      budgetLimit: status.limit.format(),
      consumptionRatio: status.consumptionRatio,
    }));

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
