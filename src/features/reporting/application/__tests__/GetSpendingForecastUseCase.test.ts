import { describe, it, expect, vi } from 'vitest';
import { GetSpendingForecastUseCase } from '../use-cases/GetSpendingForecastUseCase';
import { IReportingRepository, ReportingPeriod } from '../../domain';
import { IAIInsightsProvider } from '../../../insights/application';
import { CashFlowForecast, ConfidenceScore } from '../../../insights/domain';
import { Result } from '../../../../platform/persistence';

describe('GetSpendingForecastUseCase', () => {
  it('orchestrates monthly trends and calls AI Insights provider for forecast', async () => {
    const mockRepo: Partial<IReportingRepository> = {
      getMonthlyTrend: vi.fn().mockResolvedValue(
        Result.success({
          points: [
            { periodLabel: '2026-01', income: 10000, expenses: 6000, netCashFlow: 4000 },
            { periodLabel: '2026-02', income: 12000, expenses: 7000, netCashFlow: 5000 },
          ],
        })
      ),
    };

    const mockForecast = new CashFlowForecast({
      predictedIncome: 11000,
      predictedExpense: 6500,
      confidenceScore: new ConfidenceScore(0.85),
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
    });

    const mockProvider: Partial<IAIInsightsProvider> = {
      generateForecast: vi.fn().mockResolvedValue(mockForecast),
    };

    const useCase = new GetSpendingForecastUseCase(
      mockRepo as IReportingRepository,
      mockProvider as IAIInsightsProvider
    );

    const res = await useCase.execute({ reportingPeriod: ReportingPeriod.MONTH });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.projectedSavings).toBe(4500);
    }
    expect(mockProvider.generateForecast).toHaveBeenCalledWith([
      { periodLabel: '2026-01', income: 10000, expenses: 6000, netCashFlow: 4000 },
      { periodLabel: '2026-02', income: 12000, expenses: 7000, netCashFlow: 5000 },
    ]);
  });
});
