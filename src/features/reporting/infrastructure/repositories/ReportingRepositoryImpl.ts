import { IReportingRepository, ReportingPeriod, DashboardSummary, CategoryBreakdown, MonthlyTrendPoint, BudgetPerformance, LargestTransaction, MonthOverMonthComparison, RawLedgerRow } from '../../domain';
import { ReportingDataSource, RawCategoryBreakdown } from '../datasources/ReportingDataSource';
import { RepositoryResult, RepositoryError, Result } from '../../../../platform/persistence';
import { DashboardSummaryInfraMapper } from '../mappers/DashboardSummaryInfraMapper';
import { CategoryBreakdownInfraMapper } from '../mappers/CategoryBreakdownInfraMapper';
import { MonthlyTrendInfraMapper } from '../mappers/MonthlyTrendInfraMapper';
import { BudgetPerformanceInfraMapper } from '../mappers/BudgetPerformanceInfraMapper';
import { LargestTransactionInfraMapper } from '../mappers/LargestTransactionInfraMapper';

/**
 * ReportingRepositoryImpl
 *
 * - Implements IReportingRepository.
 * - Delegates ALL data fetching to ReportingDataSource.
 * - Performs NO aggregation (that is the datasource/database's responsibility).
 * - Translates datasource exceptions into RepositoryError (does not swallow them).
 * - Maps raw persistence shapes into immutable Domain projections.
 */
export class ReportingRepositoryImpl implements IReportingRepository {
  constructor(private readonly dataSource: ReportingDataSource) {}

  public async getDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<DashboardSummary, RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchDashboardSummary(period, startDate, endDate, categoryId);
      return Result.success(DashboardSummaryInfraMapper.toDomain(raw));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch dashboard summary', undefined, err as Error));
    }
  }

  public async getCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<CategoryBreakdown[], RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchCategoryBreakdown(period, startDate, endDate, categoryId);
      return Result.success(CategoryBreakdownInfraMapper.toDomain(raw as (RawCategoryBreakdown & { _grand_total?: number })[]));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch category breakdown', undefined, err as Error));
    }
  }

  public async getMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<{ points: MonthlyTrendPoint[]; previousPeriodTotal?: number }, RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchMonthlyTrend(period, startDate, endDate, categoryId);
      return Result.success(MonthlyTrendInfraMapper.toDomain(raw));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch monthly trend', undefined, err as Error));
    }
  }

  public async getBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<BudgetPerformance[], RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchBudgetPerformance(period, startDate, endDate, categoryId);
      return Result.success(BudgetPerformanceInfraMapper.toDomain(raw));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch budget performance', undefined, err as Error));
    }
  }

  public async getLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<LargestTransaction[], RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchLargestTransactions(period, startDate, endDate, categoryId);
      return Result.success(LargestTransactionInfraMapper.toDomain(raw));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch largest transactions', undefined, err as Error));
    }
  }

  public async getMonthOverMonthComparison(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<MonthOverMonthComparison, RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchMonthOverMonthComparison(period, startDate, endDate, categoryId);
      return Result.success(
        new MonthOverMonthComparison({
          currentIncome: raw.current_income,
          currentExpense: raw.current_expense,
          currentNetSavings: raw.current_net_savings,
          previousIncome: raw.previous_income,
          previousExpense: raw.previous_expense,
          previousNetSavings: raw.previous_net_savings,
        })
      );
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch month over month comparison', undefined, err as Error));
    }
  }

  public async getFilteredLedgerRows(
    startDate: Date,
    endDate: Date,
    categoryId?: string | null
  ): Promise<RepositoryResult<RawLedgerRow[], RepositoryError>> {
    try {
      const raw = await this.dataSource.fetchFilteredLedgerRows(startDate, endDate, categoryId);
      return Result.success(raw);
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to fetch filtered ledger rows', undefined, err as Error));
    }
  }
}
