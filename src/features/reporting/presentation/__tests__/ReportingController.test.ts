import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportingController } from '../controllers/ReportingController';
import { ReportingPeriod } from '../../domain';
import { Result } from '../../../../platform/persistence';

describe('ReportingController', () => {
  let mockGetFinancialSummary: any;
  let mockGetCategoryBreakdown: any;
  let mockGetMonthlyTrend: any;
  let controller: ReportingController;

  beforeEach(() => {
    mockGetFinancialSummary = {
      execute: vi.fn().mockResolvedValue({
        totalIncome: 100000,
        totalExpense: 30000,
        netSavings: 70000,
        savingsRatePercentage: 70,
      }),
    };
    mockGetCategoryBreakdown = {
      execute: vi.fn().mockResolvedValue(Result.success([])),
    };
    mockGetMonthlyTrend = {
      execute: vi.fn().mockResolvedValue(Result.success({ points: [] })),
    };

    controller = new ReportingController(
      mockGetFinancialSummary,
      mockGetCategoryBreakdown,
      mockGetMonthlyTrend
    );
  });

  it('loads report data and updates reactive state', async () => {
    await controller.loadReports();
    const state = controller.getState();

    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.viewModel.financialSummary?.savingsRatePercentage).toBe(70);
  });

  it('handles period change and triggers report reloading', async () => {
    await controller.changePeriod(ReportingPeriod.YEAR);
    const state = controller.getState();

    expect(state.selectedPeriod).toBe(ReportingPeriod.YEAR);
    expect(mockGetFinancialSummary.execute).toHaveBeenCalledWith({
      periodKind: ReportingPeriod.YEAR,
    });
  });
});
