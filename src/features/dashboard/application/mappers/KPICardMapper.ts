import { FinancialSummary } from '../../domain/value-objects/FinancialSummary';
import { TrendIndicator } from '../../domain/value-objects/TrendIndicator';
import { KPICardViewModel } from '../view-models/KPICardViewModel';
import { TrendIndicatorViewModel } from '../view-models/TrendIndicatorViewModel';

export class KPICardMapper {
  static mapToViewModel(summary: FinancialSummary): KPICardViewModel {
    return {
      sectionType: 'KPI',
      status: 'Loaded',
      isLoading: false,
      isEmpty: false,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: {
        totalBalance: summary.totalBalance.format(),
        periodIncome: summary.periodIncome.format(),
        periodExpenses: summary.periodExpenses.format(),
        netForPeriod: summary.netForPeriod.format(),
        incomeTrend: this.mapTrend(undefined),
        expenseTrend: this.mapTrend(undefined),
      }
    };
  }

  static mapEmpty(): KPICardViewModel {
    return {
      sectionType: 'KPI',
      status: 'Empty',
      isLoading: false,
      isEmpty: true,
      error: null,
      retryToken: null,
      lastUpdated: new Date(),
      content: null
    };
  }

  static mapError(error: Error, retryToken: string): KPICardViewModel {
    return {
      sectionType: 'KPI',
      status: 'Error',
      isLoading: false,
      isEmpty: false,
      error: error.message,
      retryToken,
      lastUpdated: new Date(),
      content: null
    };
  }

  private static mapTrend(trend?: any): TrendIndicatorViewModel {
    if (!trend) {
      return {
        direction: 'Neutral',
        label: '-',
        accessibilityLabel: 'No change'
      };
    }
    return {
      direction: trend.direction === 'UP' ? 'Positive' : trend.direction === 'DOWN' ? 'Negative' : 'Neutral',
      label: trend.percentageChange != null ? `${trend.percentageChange > 0 ? '+' : ''}${trend.percentageChange.toFixed(1)}%` : '-',
      accessibilityLabel: trend.percentageChange != null ? `${trend.direction === 'UP' ? 'Increased' : trend.direction === 'DOWN' ? 'Decreased' : 'Changed'} by ${Math.abs(trend.percentageChange).toFixed(1)} percent` : 'No change'
    };
  }
}
