import { MonthlyTrendPoint, TrendComparison } from '../../domain';
import { MonthlyTrendResponse, MonthlyTrendPointItem } from '../responses/MonthlyTrendResponse';

export function calculateTrendComparison(currentTotal: number, previousTotal: number): TrendComparison {
  const absoluteChange = currentTotal - previousTotal;
  let percentageChange = 0;
  if (previousTotal === 0) {
    percentageChange = currentTotal > 0 ? 100 : 0;
  } else {
    percentageChange = (absoluteChange / previousTotal) * 100;
  }
  return {
    currentTotal,
    previousPeriodTotal: previousTotal,
    absoluteChange,
    percentageChange,
  };
}

export class MonthlyTrendMapper {
  public static toResponse(
    projections: MonthlyTrendPoint[],
    previousPeriodTotal?: number
  ): MonthlyTrendResponse {
    const items: MonthlyTrendPointItem[] = projections.map((p) => ({
      period: p.period,
      income: p.income,
      expenses: p.expenses,
      netCashFlow: p.netCashFlow,
    }));

    const currentTotal = projections.reduce((sum, p) => sum + p.expenses, 0);

    const comparison =
      previousPeriodTotal !== undefined
        ? calculateTrendComparison(currentTotal, previousPeriodTotal)
        : undefined;

    return { items, comparison };
  }
}
