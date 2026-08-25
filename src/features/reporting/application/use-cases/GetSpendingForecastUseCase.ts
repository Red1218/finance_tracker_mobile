import { IReportingRepository } from '../../domain';
import { IAIInsightsProvider } from '../../../insights/application';
import { CashFlowForecast } from '../../../insights/domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetSpendingForecastUseCase {
  constructor(
    private readonly reportingRepository: IReportingRepository,
    private readonly insightsProvider: IAIInsightsProvider
  ) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<CashFlowForecast>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const trendResult = await this.reportingRepository.getMonthlyTrend(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate,
        request.categoryId
      );

      if (!trendResult.success) return trendResult;

      const forecast = await this.insightsProvider.generateForecast(trendResult.data.points);
      return Result.success(forecast);
    });
  }
}
