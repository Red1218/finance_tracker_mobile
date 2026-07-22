import { useQuery } from '@tanstack/react-query';
import { GetDashboardSummaryUseCase } from '../../application';
import { ReportingPeriod } from '../../domain';
import { reportingKeys } from './queryKeys';

export function useDashboardSummary(
  useCase: GetDashboardSummaryUseCase,
  reportingPeriod: ReportingPeriod,
  customStartDate?: Date,
  customEndDate?: Date
) {
  return useQuery({
    queryKey: reportingKeys.dashboardSummary(
      reportingPeriod,
      customStartDate?.toISOString(),
      customEndDate?.toISOString()
    ),
    queryFn: async () => {
      const result = await useCase.execute({ reportingPeriod, customStartDate, customEndDate });
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}
