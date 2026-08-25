import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardSummaryUseCase } from '../use-cases/GetDashboardSummaryUseCase';
import { GetCategoryBreakdownUseCase } from '../use-cases/GetCategoryBreakdownUseCase';
import { GetMonthlyTrendUseCase } from '../use-cases/GetMonthlyTrendUseCase';
import { GetBudgetPerformanceUseCase } from '../use-cases/GetBudgetPerformanceUseCase';
import { GetLargestTransactionsUseCase } from '../use-cases/GetLargestTransactionsUseCase';
import { IReportingRepository, ReportingPeriod } from '../../domain';
import { Result } from '../../../../platform/persistence';

// ---------------------------------------------------------------------------
// Shared mock factory
// ---------------------------------------------------------------------------
function makeMockRepo(): IReportingRepository {
  return {
    getDashboardSummary: vi.fn(),
    getCategoryBreakdown: vi.fn(),
    getMonthlyTrend: vi.fn(),
    getBudgetPerformance: vi.fn(),
    getLargestTransactions: vi.fn(),
    getMonthOverMonthComparison: vi.fn(),
    getFilteredLedgerRows: vi.fn(),
  };
}

const STANDARD_REQUEST = { reportingPeriod: ReportingPeriod.MONTH };
const CUSTOM_REQUEST_VALID = {
  reportingPeriod: ReportingPeriod.CUSTOM,
  customStartDate: new Date('2026-01-01'),
  customEndDate: new Date('2026-03-31'),
};
const CUSTOM_REQUEST_MISSING_END = {
  reportingPeriod: ReportingPeriod.CUSTOM,
  customStartDate: new Date('2026-01-01'),
};
const CUSTOM_REQUEST_START_AFTER_END = {
  reportingPeriod: ReportingPeriod.CUSTOM,
  customStartDate: new Date('2026-03-31'),
  customEndDate: new Date('2026-01-01'),
};

// ---------------------------------------------------------------------------
// GetDashboardSummaryUseCase
// ---------------------------------------------------------------------------
describe('GetDashboardSummaryUseCase', () => {
  let repo: ReturnType<typeof makeMockRepo>;
  let useCase: GetDashboardSummaryUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetDashboardSummaryUseCase(repo);
  });

  it('✓ returns response DTO on success', async () => {
    (repo.getDashboardSummary as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success({ totalIncome: 1000, totalExpenses: 600, netCashFlow: 400, savingsRate: 40, transactionCount: 5 })
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalIncome).toBe(1000);
      expect(result.data.savingsRate).toBe(40);
    }
  });

  it('✓ propagates repository failure', async () => {
    (repo.getDashboardSummary as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.failure(new Error('db error'))
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(false);
  });

  it('✓ validates CUSTOM period — missing end date', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_MISSING_END);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toMatch(/customEndDate/);
  });

  it('✓ validates CUSTOM period — start after end', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_START_AFTER_END);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toMatch(/before/);
  });

  it('✓ accepts valid CUSTOM period', async () => {
    (repo.getDashboardSummary as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success({ totalIncome: 0, totalExpenses: 0, netCashFlow: 0, savingsRate: 0, transactionCount: 0 })
    );
    const result = await useCase.execute(CUSTOM_REQUEST_VALID);
    expect(result.success).toBe(true);
  });

  it('✓ forwards categoryId filter to repository', async () => {
    (repo.getDashboardSummary as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success({ totalIncome: 500, totalExpenses: 200, netCashFlow: 300, savingsRate: 60, transactionCount: 2 })
    );
    const result = await useCase.execute({ ...STANDARD_REQUEST, categoryId: 'cat-123' });
    expect(result.success).toBe(true);
    expect(repo.getDashboardSummary).toHaveBeenCalledWith(
      ReportingPeriod.MONTH,
      undefined,
      undefined,
      'cat-123'
    );
  });
});

// ---------------------------------------------------------------------------
// GetCategoryBreakdownUseCase
// ---------------------------------------------------------------------------
describe('GetCategoryBreakdownUseCase', () => {
  let repo: ReturnType<typeof makeMockRepo>;
  let useCase: GetCategoryBreakdownUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetCategoryBreakdownUseCase(repo);
  });

  it('✓ returns collection response on success', async () => {
    (repo.getCategoryBreakdown as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success([
        { categoryId: 'cat-1', categoryName: 'Food', amount: 300, percentage: 50, transactionCount: 3 },
      ])
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].categoryName).toBe('Food');
    }
  });

  it('✓ rejects invalid CUSTOM request', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_MISSING_END);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GetMonthlyTrendUseCase
// ---------------------------------------------------------------------------
describe('GetMonthlyTrendUseCase', () => {
  let repo: ReturnType<typeof makeMockRepo>;
  let useCase: GetMonthlyTrendUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetMonthlyTrendUseCase(repo);
  });

  it('✓ returns collection response on success', async () => {
    (repo.getMonthlyTrend as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success({
        points: [{ period: '2026-01', income: 500, expenses: 300, netCashFlow: 200 }],
        previousPeriodTotal: 250,
      })
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].period).toBe('2026-01');
    }
  });

  it('✓ rejects invalid CUSTOM request', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_START_AFTER_END);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GetBudgetPerformanceUseCase
// ---------------------------------------------------------------------------
describe('GetBudgetPerformanceUseCase', () => {
  let repo: ReturnType<typeof makeMockRepo>;
  let useCase: GetBudgetPerformanceUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetBudgetPerformanceUseCase(repo);
  });

  it('✓ returns collection response on success', async () => {
    (repo.getBudgetPerformance as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success([
        {
          budgetId: 'b-1', categoryId: null, categoryName: null,
          budgetAmount: 1000, actualSpent: 600, remaining: 400,
          utilization: 60, status: 'Safe' as const,
        },
      ])
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].status).toBe('Safe');
    }
  });

  it('✓ rejects invalid CUSTOM request', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_MISSING_END);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GetLargestTransactionsUseCase
// ---------------------------------------------------------------------------
describe('GetLargestTransactionsUseCase', () => {
  let repo: ReturnType<typeof makeMockRepo>;
  let useCase: GetLargestTransactionsUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetLargestTransactionsUseCase(repo);
  });

  it('✓ returns collection response on success', async () => {
    (repo.getLargestTransactions as ReturnType<typeof vi.fn>).mockResolvedValue(
      Result.success([
        { expenseId: 'e-1', merchant: 'Amazon', categoryName: 'Shopping', amount: 250, transactionDate: '2026-06-15' },
      ])
    );
    const result = await useCase.execute(STANDARD_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].merchant).toBe('Amazon');
    }
  });

  it('✓ rejects invalid CUSTOM request', async () => {
    const result = await useCase.execute(CUSTOM_REQUEST_START_AFTER_END);
    expect(result.success).toBe(false);
  });
});
