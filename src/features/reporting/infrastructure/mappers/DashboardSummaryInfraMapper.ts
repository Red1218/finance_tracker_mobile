import { DashboardSummary } from '../../domain';
import { RawDashboardSummary } from '../datasources/ReportingDataSource';

export class DashboardSummaryInfraMapper {
  public static toDomain(raw: RawDashboardSummary): DashboardSummary {
    const netCashFlow = raw.total_income - raw.total_expenses;
    const savingsRate = raw.total_income > 0
      ? ((netCashFlow / raw.total_income) * 100)
      : 0;

    return {
      totalIncome: raw.total_income,
      totalExpenses: raw.total_expenses,
      netCashFlow,
      savingsRate,
      transactionCount: raw.transaction_count,
    };
  }
}
