import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';
import { DashboardSummary } from '../projections/DashboardSummary';
import { CategoryBreakdown } from '../projections/CategoryBreakdown';
import { MonthlyTrendPoint } from '../projections/MonthlyTrendPoint';
import { BudgetPerformance } from '../projections/BudgetPerformance';
import { LargestTransaction } from '../projections/LargestTransaction';
import { MonthOverMonthComparison } from '../value-objects/MonthOverMonthComparison';

export interface RawLedgerRow {
  readonly transactionDate: string;
  readonly type: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly accountName: string;
  readonly description: string;
  readonly status: string;
}

export interface IReportingRepository {
  getDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<DashboardSummary, RepositoryError>>;

  getCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<CategoryBreakdown[], RepositoryError>>;

  getMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<{ points: MonthlyTrendPoint[]; previousPeriodTotal?: number }, RepositoryError>>;

  getBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<BudgetPerformance[], RepositoryError>>;

  getLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<LargestTransaction[], RepositoryError>>;

  getMonthOverMonthComparison(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<MonthOverMonthComparison, RepositoryError>>;

  getFilteredLedgerRows(
    startDate: Date,
    endDate: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<RawLedgerRow[], RepositoryError>>;
}
