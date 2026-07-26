import { IAIInsightsProvider } from '../providers/IAIInsightsProvider';
import { IReportingRepository, ReportingPeriod } from '../../../reporting/domain';

export interface CashFlowForecastDTO {
  predictedIncome: number;
  predictedExpense: number;
  projectedSavings: number;
  confidenceScore: number;
  confidencePercentage: number;
  startDate: string;
  endDate: string;
}

export class GetCashFlowForecastUseCase {
  constructor(
    private readonly reportingRepo: IReportingRepository,
    private readonly aiProvider: IAIInsightsProvider
  ) {
    Object.freeze(this);
  }

  public async execute(): Promise<CashFlowForecastDTO> {
    const trendResult = await this.reportingRepo.getMonthlyTrend(ReportingPeriod.YEAR);
    const points = trendResult.success ? trendResult.data.points : [];

    const forecast = await this.aiProvider.generateForecast(points);

    return {
      predictedIncome: forecast.predictedIncome,
      predictedExpense: forecast.predictedExpense,
      projectedSavings: forecast.projectedSavings,
      confidenceScore: forecast.confidenceScore.score,
      confidencePercentage: forecast.confidenceScore.toPercentage(),
      startDate: forecast.startDate.toISOString(),
      endDate: forecast.endDate.toISOString(),
    };
  }
}
