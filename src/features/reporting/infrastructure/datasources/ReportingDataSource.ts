import { ReportingPeriod, RawLedgerRow } from '../../domain';

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
  period: string; // e.g. '2026-06' or '2026-06-15'
  total_income: number;
  total_expenses: number;
}

export interface RawMonthlyTrendResult {
  items: RawMonthlyTrendPoint[];
  previousPeriodTotal: number;
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

export interface RawMonthOverMonthComparison {
  current_income: number;
  current_expense: number;
  current_net_savings: number;
  previous_income: number;
  previous_expense: number;
  previous_net_savings: number;
}

export interface ReportingDataSource {
  fetchDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawDashboardSummary>;

  fetchCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawCategoryBreakdown[]>;

  fetchMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawMonthlyTrendResult>;

  fetchBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawBudgetPerformance[]>;

  fetchLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawLargestTransaction[]>;

  fetchMonthOverMonthComparison(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawMonthOverMonthComparison>;

  fetchFilteredLedgerRows(
    startDate: Date,
    endDate: Date,
    categoryId?: string | null
  ): Promise<RawLedgerRow[]>;
}
