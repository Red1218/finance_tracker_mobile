import { SupabaseClient } from '@supabase/supabase-js';
import {
  ReportingDataSource,
  RawDashboardSummary,
  RawCategoryBreakdown,
  RawMonthlyTrendPoint,
  RawMonthlyTrendResult,
  RawBudgetPerformance,
  RawLargestTransaction,
} from './ReportingDataSource';
import { ReportingPeriod } from '../../domain';
import { resolveDateRange, resolvePreviousDateRange, resolveAggregationGranularity } from '../utils/dateRangeUtils';

const EXPENSES_TABLE = 'expenses';
const BUDGETS_TABLE = 'budgets';
const CATEGORIES_TABLE = 'categories';

export class SupabaseReportingDataSource implements ReportingDataSource {
  constructor(private readonly supabase: SupabaseClient) {}

  public async fetchDashboardSummary(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawDashboardSummary> {
    const { start, end } = resolveDateRange(period, startDate, endDate);

    let query = this.supabase
      .from(EXPENSES_TABLE)
      .select('amount, type')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString());

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`fetchDashboardSummary failed: ${error.message}`);

    const rows = data ?? [];
    let total_income = 0;
    let total_expenses = 0;

    for (const row of rows) {
      if (row.type === 'income') {
        total_income += Number(row.amount);
      } else {
        total_expenses += Number(row.amount);
      }
    }

    return {
      total_income,
      total_expenses,
      transaction_count: rows.length,
    };
  }

  public async fetchCategoryBreakdown(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawCategoryBreakdown[]> {
    const { start, end } = resolveDateRange(period, startDate, endDate);

    let query = this.supabase
      .from(EXPENSES_TABLE)
      .select(`amount, category_id, ${CATEGORIES_TABLE}(name)`)
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .eq('type', 'expense');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`fetchCategoryBreakdown failed: ${error.message}`);

    const rows = data ?? [];
    const map = new Map<string, { name: string; total: number; count: number }>();

    for (const row of rows) {
      const id = row.category_id ?? 'uncategorised';
      const name = (row as any).categories?.name ?? 'Uncategorised';
      const existing = map.get(id) ?? { name, total: 0, count: 0 };
      existing.total += Number(row.amount);
      existing.count += 1;
      map.set(id, existing);
    }

    const grandTotal = [...map.values()].reduce((sum, v) => sum + v.total, 0);

    return [...map.entries()].map(([id, v]) => ({
      category_id: id,
      category_name: v.name,
      total_amount: v.total,
      transaction_count: v.count,
      _grand_total: grandTotal,
    } as RawCategoryBreakdown & { _grand_total: number }));
  }

  public async fetchMonthlyTrend(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawMonthlyTrendResult> {
    const { start, end } = resolveDateRange(period, startDate, endDate);
    const granularity = resolveAggregationGranularity(period, startDate, endDate);

    let query = this.supabase
      .from(EXPENSES_TABLE)
      .select('amount, type, date')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString());

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`fetchMonthlyTrend failed: ${error.message}`);

    const rows = data ?? [];
    const map = new Map<string, { income: number; expenses: number }>();
    const sliceLen = granularity === 'DAILY' ? 10 : 7;

    for (const row of rows) {
      const periodKey = row.date.slice(0, sliceLen);
      const entry = map.get(periodKey) ?? { income: 0, expenses: 0 };
      if (row.type === 'income') {
        entry.income += Number(row.amount);
      } else {
        entry.expenses += Number(row.amount);
      }
      map.set(periodKey, entry);
    }

    const items = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodKey, v]) => ({
        period: periodKey,
        total_income: v.income,
        total_expenses: v.expenses,
      }));

    // Fetch previous period total
    const prevRange = resolvePreviousDateRange(period, startDate, endDate);
    let prevQuery = this.supabase
      .from(EXPENSES_TABLE)
      .select('amount')
      .gte('date', prevRange.start.toISOString())
      .lte('date', prevRange.end.toISOString())
      .eq('type', 'expense');

    if (categoryId) {
      prevQuery = prevQuery.eq('category_id', categoryId);
    }

    const { data: prevData } = await prevQuery;
    const previousPeriodTotal = (prevData ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

    return { items, previousPeriodTotal };
  }

  public async fetchBudgetPerformance(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawBudgetPerformance[]> {
    const { start, end } = resolveDateRange(period, startDate, endDate);

    let budgetQuery = this.supabase
      .from(BUDGETS_TABLE)
      .select(`id, category_id, amount, ${CATEGORIES_TABLE}(name)`)
      .gte('start_date', start.toISOString())
      .lte('end_date', end.toISOString());

    if (categoryId) {
      budgetQuery = budgetQuery.eq('category_id', categoryId);
    }

    const { data: budgets, error: budgetError } = await budgetQuery;

    if (budgetError) throw new Error(`fetchBudgetPerformance (budgets) failed: ${budgetError.message}`);
    if (!budgets || budgets.length === 0) return [];

    let expenseQuery = this.supabase
      .from(EXPENSES_TABLE)
      .select('amount, category_id')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .eq('type', 'expense');

    if (categoryId) {
      expenseQuery = expenseQuery.eq('category_id', categoryId);
    }

    const { data: expenses, error: expenseError } = await expenseQuery;

    if (expenseError) throw new Error(`fetchBudgetPerformance (expenses) failed: ${expenseError.message}`);

    const expensesByCategory = new Map<string | null, number>();
    for (const expense of expenses ?? []) {
      const key = expense.category_id ?? null;
      expensesByCategory.set(key, (expensesByCategory.get(key) ?? 0) + Number(expense.amount));
    }

    return budgets.map((b) => ({
      budget_id: b.id,
      category_id: b.category_id ?? null,
      category_name: (b as any).categories?.name ?? null,
      budget_amount: Number(b.amount),
      actual_spent: expensesByCategory.get(b.category_id ?? null) ?? 0,
    }));
  }

  public async fetchLargestTransactions(
    period: ReportingPeriod,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null
  ): Promise<RawLargestTransaction[]> {
    const { start, end } = resolveDateRange(period, startDate, endDate);

    let query = this.supabase
      .from(EXPENSES_TABLE)
      .select(`id, merchant, amount, date, ${CATEGORIES_TABLE}(name)`)
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .eq('type', 'expense');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    query = query.order('amount', { ascending: false }).limit(10);

    const { data, error } = await query;

    if (error) throw new Error(`fetchLargestTransactions failed: ${error.message}`);

    return (data ?? []).map((row) => ({
      expense_id: row.id,
      merchant: row.merchant ?? '',
      category_name: (row as any).categories?.name ?? 'Uncategorised',
      amount: Number(row.amount),
      transaction_date: row.date,
    }));
  }
}
