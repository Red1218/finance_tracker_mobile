import { useQuery } from '@tanstack/react-query';
import { GetDashboardSummaryUseCase } from '../../application';
import { ReportingPeriod } from '../../domain';
import { reportingKeys } from './queryKeys';
import { ReportingFiltersParams } from '../types/types';

export function isValidDateRange(period: ReportingPeriod, start?: Date, end?: Date): boolean {
  if (period === ReportingPeriod.CUSTOM) {
    if (!start || !end) return false;
    return start <= end;
  }
  return true;
}

export function useDashboardSummary(
  useCase: GetDashboardSummaryUseCase,
  params: ReportingFiltersParams
) {
  const { reportingPeriod, customStartDate, customEndDate, categoryId } = params;
  const isRangeValid = isValidDateRange(reportingPeriod, customStartDate, customEndDate);

  return useQuery({
    queryKey: reportingKeys.dashboardSummary(
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
