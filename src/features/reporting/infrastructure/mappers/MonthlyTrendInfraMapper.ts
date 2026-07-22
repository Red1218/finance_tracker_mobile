import { MonthlyTrendPoint } from '../../domain';
import { RawMonthlyTrendPoint } from '../datasources/ReportingDataSource';

export class MonthlyTrendInfraMapper {
  public static toDomain(rows: RawMonthlyTrendPoint[]): MonthlyTrendPoint[] {
    return rows.map((r) => ({
      period: r.period,
      income: r.total_income,
      expenses: r.total_expenses,
      netCashFlow: r.total_income - r.total_expenses,
    }));
  }
}
