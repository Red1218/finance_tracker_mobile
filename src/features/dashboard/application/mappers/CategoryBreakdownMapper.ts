import { CategorySpendSummary } from '../../domain/value-objects/CategorySpendSummary';
import { CategoryBreakdownViewModel, CategoryBreakdownRow } from '../view-models/CategoryBreakdownViewModel';

export class CategoryBreakdownMapper {
  static mapToViewModel(summaries: CategorySpendSummary[], categoryNames?: Record<string, string>): CategoryBreakdownViewModel {
    if (summaries.length === 0) {
      return this.mapEmpty();
    }

    const rows: CategoryBreakdownRow[] = summaries.map((summary, index) => ({
      categoryName: categoryNames?.[summary.categoryId] || `Category ${summary.categoryId}`,
      amountSpent: summary.totalAmountSpent.format(),
      proportion: summary.proportionOfTotalSpending,
      rank: index + 1,
      displayIcon: this.getDefaultIcon(categoryNames?.[summary.categoryId] || summary.categoryId)
    }));

    return {
      sectionType: 'CategoryBreakdown',
      status: 'Loaded',
      isLoading: false,
      isEmpty: false,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: rows
    };
  }

  static mapEmpty(): CategoryBreakdownViewModel {
    return {
      sectionType: 'CategoryBreakdown',
      status: 'Empty',
      isLoading: false,
      isEmpty: true,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: null
    };
  }

  static mapError(error: Error, retryToken: string): CategoryBreakdownViewModel {
    return {
      sectionType: 'CategoryBreakdown',
      status: 'Error',
      isLoading: false,
      isEmpty: false,
      error: error.message,
      retryToken,
      lastUpdated: new Date(),
      content: null
    };
  }

  private static getDefaultIcon(categoryName: string): string {
    return 'default-category-icon';
  }
}
