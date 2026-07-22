import { useQuery } from '@tanstack/react-query';
import { GetMonthlyTrendUseCase } from '../../application';
import { ReportingPeriod } from '../../domain';
import { reportingKeys } from './queryKeys';

export function useMonthlyTrend(
  useCase: GetMonthlyTrendUseCase,
  reportingPeriod: ReportingPeriod,
  customStartDate?: Date,
  customEndDate?: Date
) {
  return useQuery({
    queryKey: reportingKeys.monthlyTrend(
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
