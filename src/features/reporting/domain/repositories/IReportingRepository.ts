import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';
import { DashboardSummary } from '../projections/DashboardSummary';
import { CategoryBreakdown } from '../projections/CategoryBreakdown';
import { MonthlyTrendPoint } from '../projections/MonthlyTrendPoint';
import { BudgetPerformance } from '../projections/BudgetPerformance';
import { LargestTransaction } from '../projections/LargestTransaction';

export interface IReportingRepository {
  getDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RepositoryResult<DashboardSummary, RepositoryError>>;

  getCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RepositoryResult<CategoryBreakdown[], RepositoryError>>;

  getMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RepositoryResult<MonthlyTrendPoint[], RepositoryError>>;

  getBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RepositoryResult<BudgetPerformance[], RepositoryError>>;

  getLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RepositoryResult<LargestTransaction[], RepositoryError>>;
}
