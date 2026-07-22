import { supabase } from '../../../database/client';
import { SupabaseReportingDataSource } from '../infrastructure/datasources/SupabaseReportingDataSource';
import { ReportingRepositoryImpl } from '../infrastructure/repositories/ReportingRepositoryImpl';
import {
  GetDashboardSummaryUseCase,
  GetCategoryBreakdownUseCase,
  GetMonthlyTrendUseCase,
  GetBudgetPerformanceUseCase,
  GetLargestTransactionsUseCase,
} from '../application';

/**
 * ReportingModule
 *
 * Wires the concrete Supabase data source → ReportingRepositoryImpl → all 5 use cases.
 * Single long-lived instance. Object.freeze prevents mutation after construction.
 *
 * Follows the same composition pattern as BudgetsModule.
 */
export class ReportingModule {
  public readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  public readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase;
  public readonly getMonthlyTrendUseCase: GetMonthlyTrendUseCase;
  public readonly getBudgetPerformanceUseCase: GetBudgetPerformanceUseCase;
  public readonly getLargestTransactionsUseCase: GetLargestTransactionsUseCase;

  constructor(dataSource = new SupabaseReportingDataSource(supabase)) {
    const repository = new ReportingRepositoryImpl(dataSource);

    this.getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(repository);
    this.getCategoryBreakdownUseCase = new GetCategoryBreakdownUseCase(repository);
    this.getMonthlyTrendUseCase = new GetMonthlyTrendUseCase(repository);
    this.getBudgetPerformanceUseCase = new GetBudgetPerformanceUseCase(repository);
    this.getLargestTransactionsUseCase = new GetLargestTransactionsUseCase(repository);

    Object.freeze(this);
  }
}

export const reportingModule = new ReportingModule();
