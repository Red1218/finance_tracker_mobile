import { TransactionSnapshot } from '../../domain/snapshots/TransactionSnapshot';
import { RecentActivityViewModel, RecentActivityRow } from '../view-models/RecentActivityViewModel';

export class RecentActivityMapper {
  static mapToViewModel(transactions: TransactionSnapshot[], hasMore: boolean = false): RecentActivityViewModel {
    if (transactions.length === 0) {
      return this.mapEmpty();
    }

    const rows: RecentActivityRow[] = transactions.map(t => ({
      description: t.description,
      categoryName: t.categoryId, // In a real app we might fetch the category name, here we use ID as fallback or assume name is provided
      date: t.occurredAt.toISOString(),
      amount: t.amount.format(),
      direction: t.direction
    }));

    return {
      sectionType: 'RecentActivity',
      status: 'Loaded',
      isLoading: false,
      isEmpty: false,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: {
        rows,
        hasMore
      }
    };
  }

  static mapEmpty(): RecentActivityViewModel {
    return {
      sectionType: 'RecentActivity',
      status: 'Empty',
      isLoading: false,
      isEmpty: true,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: null
    };
  }

  static mapError(error: Error, retryToken: string): RecentActivityViewModel {
    return {
      sectionType: 'RecentActivity',
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
