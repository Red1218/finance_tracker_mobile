import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportingRepositoryImpl } from '../repositories/ReportingRepositoryImpl';
import { ReportingDataSource } from '../datasources/ReportingDataSource';
import { ReportingPeriod } from '../../domain';

function makeMockDataSource(): ReportingDataSource {
  return {
    fetchDashboardSummary: vi.fn(),
    fetchCategoryBreakdown: vi.fn(),
    fetchMonthlyTrend: vi.fn(),
    fetchBudgetPerformance: vi.fn(),
    fetchLargestTransactions: vi.fn(),
    fetchMonthOverMonthComparison: vi.fn(),
    fetchFilteredLedgerRows: vi.fn(),
  };
}

describe('ReportingRepositoryImpl', () => {
  let dataSource: ReturnType<typeof makeMockDataSource>;
  let repo: ReportingRepositoryImpl;

  beforeEach(() => {
    dataSource = makeMockDataSource();
    repo = new ReportingRepositoryImpl(dataSource);
  });

  const period = ReportingPeriod.MONTH;

  it('✓ getDashboardSummary — maps raw to domain projection', async () => {
    (dataSource.fetchDashboardSummary as ReturnType<typeof vi.fn>).mockResolvedValue({
      total_income: 1000,
      total_expenses: 600,
      transaction_count: 10,
    });

    const result = await repo.getDashboardSummary(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalIncome).toBe(1000);
      expect(result.data.totalExpenses).toBe(600);
      expect(result.data.netCashFlow).toBe(400);
      expect(result.data.savingsRate).toBeCloseTo(40);
      expect(result.data.transactionCount).toBe(10);
    }
  });

  it('✓ getDashboardSummary — translates datasource error into RepositoryError', async () => {
    (dataSource.fetchDashboardSummary as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db down'));

    const result = await repo.getDashboardSummary(period);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toMatch(/dashboard summary/i);
    }
  });

  it('✓ getCategoryBreakdown — maps raw to domain projections with percentages', async () => {
    (dataSource.fetchCategoryBreakdown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { category_id: 'c1', category_name: 'Food', total_amount: 300, transaction_count: 3, _grand_total: 600 },
      { category_id: 'c2', category_name: 'Transport', total_amount: 300, transaction_count: 2, _grand_total: 600 },
    ]);

    const result = await repo.getCategoryBreakdown(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].percentage).toBeCloseTo(50);
    }
  });

  it('✓ getBudgetPerformance — derives status correctly', async () => {
    (dataSource.fetchBudgetPerformance as ReturnType<typeof vi.fn>).mockResolvedValue([
      { budget_id: 'b1', category_id: null, category_name: null, budget_amount: 1000, actual_spent: 850 },
    ]);

    const result = await repo.getBudgetPerformance(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].status).toBe('Near Limit');
      expect(result.data[0].utilization).toBeCloseTo(85);
      expect(result.data[0].remaining).toBe(150);
    }
  });

  it('✓ getBudgetPerformance — Over Budget status at 100%+', async () => {
    (dataSource.fetchBudgetPerformance as ReturnType<typeof vi.fn>).mockResolvedValue([
      { budget_id: 'b2', category_id: null, category_name: null, budget_amount: 500, actual_spent: 600 },
    ]);

    const result = await repo.getBudgetPerformance(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].status).toBe('Over Budget');
    }
  });

  it('✓ getMonthlyTrend — computes netCashFlow per period', async () => {
    (dataSource.fetchMonthlyTrend as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [{ period: '2026-06', total_income: 800, total_expenses: 500 }],
      previousPeriodTotal: 400,
    });

    const result = await repo.getMonthlyTrend(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.points[0].netCashFlow).toBe(300);
      expect(result.data.previousPeriodTotal).toBe(400);
    }
  });

  it('✓ getLargestTransactions — maps all fields', async () => {
    (dataSource.fetchLargestTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([
      { expense_id: 'e1', merchant: 'Amazon', category_name: 'Shopping', amount: 499, transaction_date: '2026-06-10' },
    ]);

    const result = await repo.getLargestTransactions(period);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].expenseId).toBe('e1');
      expect(result.data[0].merchant).toBe('Amazon');
    }
  });
});

// ---------------------------------------------------------------------------
// BudgetPerformanceInfraMapper — status thresholds
// ---------------------------------------------------------------------------
import { BudgetPerformanceInfraMapper } from '../mappers/BudgetPerformanceInfraMapper';

describe('BudgetPerformanceInfraMapper status thresholds', () => {
  const base = { budget_id: 'b', category_id: null, category_name: null };

  it('Safe below 80%', () => {
    const [r] = BudgetPerformanceInfraMapper.toDomain([{ ...base, budget_amount: 1000, actual_spent: 500 }]);
    expect(r.status).toBe('Safe');
  });

  it('Near Limit at exactly 80%', () => {
    const [r] = BudgetPerformanceInfraMapper.toDomain([{ ...base, budget_amount: 1000, actual_spent: 800 }]);
    expect(r.status).toBe('Near Limit');
  });

  it('Over Budget at exactly 100%', () => {
    const [r] = BudgetPerformanceInfraMapper.toDomain([{ ...base, budget_amount: 1000, actual_spent: 1000 }]);
    expect(r.status).toBe('Over Budget');
  });
});
