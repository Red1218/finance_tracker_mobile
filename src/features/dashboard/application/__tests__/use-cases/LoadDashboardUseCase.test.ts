import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoadDashboardUseCase } from '../../use-cases/LoadDashboardUseCase';
import { DashboardReadRepository } from '../../ports/DashboardReadRepository';
import { Logger } from '../../ports/Logger';
import { FinancialSummaryService } from '../../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../../domain/services/RecentActivityService';
import { DashboardDataSnapshot } from '../../models/DashboardDataSnapshot';

describe('LoadDashboardUseCase', () => {
  let useCase: LoadDashboardUseCase;
  let repo: DashboardReadRepository;
  let logger: Logger;
  let summaryService: FinancialSummaryService;
  let budgetService: BudgetHealthService;
  let categoryService: CategoryBreakdownService;
  let activityService: RecentActivityService;

  beforeEach(() => {
    repo = { getDashboardData: vi.fn() };
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    summaryService = { calculate: vi.fn() } as any;
    budgetService = { calculateStatus: vi.fn() } as any;
    categoryService = { calculateBreakdown: vi.fn() } as any;
    activityService = { getRecentActivity: vi.fn() } as any;

    useCase = new LoadDashboardUseCase(repo, logger, summaryService, budgetService, categoryService, activityService);
  });

  it('should successfully orchestrate load dashboard', async () => {
    const mockSnapshot: DashboardDataSnapshot = {
      activeReportingPeriodId: 'CURRENT',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-31'),
      budgets: [],
      categories: [],
      transactions: []
    };
    (repo.getDashboardData as any).mockResolvedValue(mockSnapshot);
    (summaryService.calculate as any).mockReturnValue({
      totalBalance: { format: () => '$100' },
      periodIncome: { format: () => '$100' },
      periodExpenses: { format: () => '$0' },
      netForPeriod: { format: () => '$100' },
      incomeTrend: { direction: 'UNCHANGED', percentageChange: 0 },
      expenseTrend: { direction: 'UNCHANGED', percentageChange: 0 }
    });
    (budgetService.calculateStatus as any).mockReturnValue([]);
    (categoryService.calculateBreakdown as any).mockReturnValue([]);
    (activityService.getRecentActivity as any).mockReturnValue([]);

    const result = await useCase.execute({
      correlationId: '123',
      userId: 'user1'
    });

    expect(repo.getDashboardData).toHaveBeenCalledWith('user1', undefined);
    expect(result.overallStatus).toBe('Loaded');
  });

  it('should return error dashboard if repo fails', async () => {
    (repo.getDashboardData as any).mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute({
      correlationId: '123',
      userId: 'user1'
    });

    expect(result.overallStatus).toBe('Error');
    expect(result.error).toBe('DB Error');
  });
});
