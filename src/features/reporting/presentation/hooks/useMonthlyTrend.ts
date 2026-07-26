import { useQuery } from '@tanstack/react-query';
import { GetMonthlyTrendUseCase } from '../../application';
import { reportingKeys } from './queryKeys';
import { ReportingFiltersParams } from '../types/types';
import { isValidDateRange } from './useDashboardSummary';

export function useMonthlyTrend(
  useCase: GetMonthlyTrendUseCase,
  params: ReportingFiltersParams
) {
  const { reportingPeriod, customStartDate, customEndDate, categoryId } = params;
  const isRangeValid = isValidDateRange(reportingPeriod, customStartDate, customEndDate);

  return useQuery({
    queryKey: reportingKeys.monthlyTrend(
      reportingPeriod,
      customStartDate?.toISOString(),
      customEndDate?.toISOString(),
      categoryId
    ),
    queryFn: async () => {
      const result = await useCase.execute({
        reportingPeriod,
        customStartDate,
        customEndDate,
        categoryId,
      });
      if (!result.success) throw result.error;
      return result.data;
    },
    enabled: isRangeValid,
  });
}
