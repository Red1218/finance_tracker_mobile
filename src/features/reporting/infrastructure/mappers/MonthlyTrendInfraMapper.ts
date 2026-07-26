import { MonthlyTrendPoint } from '../../domain';
import { RawMonthlyTrendResult } from '../datasources/ReportingDataSource';

export class MonthlyTrendInfraMapper {
  public static toDomain(raw: RawMonthlyTrendResult): { points: MonthlyTrendPoint[]; previousPeriodTotal?: number } {
    const points: MonthlyTrendPoint[] = raw.items.map((r) => ({
      period: r.period,
      income: r.total_income,
      expenses: r.total_expenses,
      netCashFlow: r.total_income - r.total_expenses,
    }));
    return { points, previousPeriodTotal: raw.previousPeriodTotal };
  }
}
