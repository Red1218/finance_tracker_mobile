import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardReadRepository } from '../../application/ports/DashboardReadRepository';
import { DashboardDataSnapshot } from '../../application/models/DashboardDataSnapshot';
import { BudgetSnapshot } from '../../domain/snapshots/BudgetSnapshot';
import { CategorySnapshot } from '../../domain/snapshots/CategorySnapshot';
import { TransactionSnapshot } from '../../domain/snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../domain/value-objects/MonetaryAmount';
import { Logger } from '../../application/ports/Logger';
import { TelemetryProvider } from '../../application/ports/TelemetryProvider';
import { supabase } from '../../../../database';

export class SupabaseDashboardRepository implements DashboardReadRepository {
  constructor(
    private readonly client: SupabaseClient = supabase,
    private readonly logger?: Logger,
    private readonly telemetry?: TelemetryProvider
  ) {}

  async getDashboardData(userId: string, reportingPeriodId?: string): Promise<DashboardDataSnapshot> {
    const endTimer = this.telemetry?.startTimer('SupabaseDashboardRepository.getDashboardData');
    this.logger?.debug(`Fetching dashboard data via Supabase for user: ${userId}`, { userId, reportingPeriodId });

    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Fetch Categories, Budgets, and Transactions concurrently from Supabase
      const [categoriesRes, budgetsRes, expensesRes] = await Promise.all([
        this.client.from('categories').select('id, name').eq('user_id', userId),
        this.client.from('budgets').select('id, amount, category_id').eq('user_id', userId),
        this.client.from('transactions')
          .select('id, amount, currency_code, occurred_at, category_id, description, type')
          .eq('type', 'EXPENSE')
          .eq('user_id', userId)
          .gte('occurred_at', firstDay.toISOString())
          .lte('occurred_at', lastDay.toISOString())
      ]);

      if (categoriesRes.error) {
        this.logger?.warn('Failed to fetch categories from Supabase', { error: categoriesRes.error });
      }
      if (budgetsRes.error) {
        this.logger?.warn('Failed to fetch budgets from Supabase', { error: budgetsRes.error });
      }
      if (expensesRes.error) {
        this.logger?.warn('Failed to fetch expenses from Supabase', { error: expensesRes.error });
      }

      const categories: CategorySnapshot[] = (categoriesRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        displayIcon: 'folder'
      }));

      const budgets: BudgetSnapshot[] = (budgetsRes.data || []).map((b: any) => ({
        id: b.id,
        limit: new MonetaryAmount(Number(b.amount), 'INR'),
        categoryId: b.category_id || undefined
      }));

      const transactions: TransactionSnapshot[] = (expensesRes.data || []).map((t: any) => ({
        id: t.id,
        amount: new MonetaryAmount(Number(t.amount), t.currency_code || 'INR'),
        direction: (t.type === 'INCOME') ? 'Income' : 'Expense',
        occurredAt: new Date(t.occurred_at || t.created_at || now),
        categoryId: t.category_id || '',
        description: t.description || 'Expense'
      }));

      const snapshot: DashboardDataSnapshot = {
        activeReportingPeriodId: reportingPeriodId || 'CurrentMonth',
        startDate: firstDay,
        endDate: lastDay,
        budgets,
        categories,
        transactions
      };

      if (endTimer) {
        this.telemetry?.trackDependency('SupabaseDashboard', endTimer(), true);
      }
      return snapshot;

    } catch (error: any) {
      if (endTimer) {
        this.telemetry?.trackDependency('SupabaseDashboard', endTimer(), false);
      }
      this.logger?.error('Failed to fetch dashboard data from Supabase', error, { userId });
      throw error;
    }
  }
}
