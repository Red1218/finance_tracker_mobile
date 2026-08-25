import { describe, it, expect, vi } from 'vitest';
import { GetMonthOverMonthComparisonUseCase } from '../use-cases/GetMonthOverMonthComparisonUseCase';
import { IReportingRepository, ReportingPeriod, MonthOverMonthComparison } from '../../domain';
import { Result } from '../../../../platform/persistence';

describe('GetMonthOverMonthComparisonUseCase', () => {
  it('returns month over month comparison projection successfully', async () => {
    const mockRepo: Partial<IReportingRepository> = {
      getMonthOverMonthComparison: vi.fn().mockResolvedValue(
        Result.success(
          new MonthOverMonthComparison({
            currentIncome: 10000,
            currentExpense: 6000,
            currentNetSavings: 4000,
            previousIncome: 8000,
            previousExpense: 5000,
            previousNetSavings: 3000,
          })
        )
      ),
    };

    const useCase = new GetMonthOverMonthComparisonUseCase(mockRepo as IReportingRepository);
    const res = await useCase.execute({ reportingPeriod: ReportingPeriod.MONTH });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.incomeDelta).toBe(2000);
    }
    expect(mockRepo.getMonthOverMonthComparison).toHaveBeenCalledTimes(1);
  });
});
