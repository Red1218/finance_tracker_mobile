import { ReportingPeriod } from '../../domain';

// ---------------------------------------------------------------------------
// Raw persistence shapes — these are what the database/datasource returns
// before any domain mapping occurs.
// ---------------------------------------------------------------------------

export interface RawDashboardSummary {
  total_income: number;
  total_expenses: number;
  transaction_count: number;
}

export interface RawCategoryBreakdown {
  category_id: string;
  category_name: string;
  total_amount: number;
  transaction_count: number;
}

export interface RawMonthlyTrendPoint {
  period: string; // e.g. '2026-06'
  total_income: number;
  total_expenses: number;
}

export interface RawBudgetPerformance {
  budget_id: string;
  category_id: string | null;
  category_name: string | null;
  budget_amount: number;
  actual_spent: number;
}

export interface RawLargestTransaction {
  expense_id: string;
  merchant: string;
  category_name: string;
  amount: number;
  transaction_date: string;
}

/**
 * ReportingDataSource — executes aggregation queries against the database.
 * Returns raw persistence shapes. No mapping, no business rules.
 */
export interface ReportingDataSource {
  fetchDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RawDashboardSummary>;

  fetchCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RawCategoryBreakdown[]>;

  fetchMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RawMonthlyTrendPoint[]>;

  fetchBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RawBudgetPerformance[]>;

  fetchLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<RawLargestTransaction[]>;
}
