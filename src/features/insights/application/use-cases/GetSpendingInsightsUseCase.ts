import { Insight } from '../../domain';
import { IAIInsightsProvider } from '../providers/IAIInsightsProvider';
import { IInsightsReadRepository } from '../repositories/IInsightsReadRepository';
import { IReportingRepository, ReportingPeriod } from '../../../reporting/domain';

export interface InsightDTO {
  id: string;
  type: string;
  severity: string;
  source: string;
  title: string;
  description: string;
  recommendationText: string | null;
  recommendationActionUrl: string | null;
  confidenceScore: number;
  confidencePercentage: number;
  generatedAt: string;
  isDismissed: boolean;
}

export class GetSpendingInsightsUseCase {
  constructor(
    private readonly reportingRepo: IReportingRepository,
    private readonly aiProvider: IAIInsightsProvider,
    private readonly insightsRepo: IInsightsReadRepository
  ) {
    Object.freeze(this);
  }

  public async execute(period: ReportingPeriod = ReportingPeriod.MONTH): Promise<InsightDTO[]> {
    const summaryResult = await this.reportingRepo.getDashboardSummary(period);
    const breakdownResult = await this.reportingRepo.getCategoryBreakdown(period);

    if (!summaryResult.success || !breakdownResult.success) {
      const existing = await this.insightsRepo.getInsights();
      return this.mapToDTOs(existing.filter((i) => !i.isDismissed));
    }

    const newInsights = await this.aiProvider.generateInsights(
      summaryResult.data,
      breakdownResult.data
    );

    for (const insight of newInsights) {
      await this.insightsRepo.saveInsight(insight);
    }

    const allInsights = await this.insightsRepo.getInsights();
    return this.mapToDTOs(allInsights.filter((i) => !i.isDismissed));
  }

  private mapToDTOs(insights: Insight[]): InsightDTO[] {
    return insights.map((i) => ({
      id: i.id,
      type: i.type,
      severity: i.severity,
      source: i.source,
      title: i.title,
      description: i.description,
      recommendationText: i.recommendation ? i.recommendation.text : null,
      recommendationActionUrl: i.recommendation?.actionUrl ?? null,
      confidenceScore: i.confidenceScore.score,
      confidencePercentage: i.confidenceScore.toPercentage(),
      generatedAt: i.generatedAt.toISOString(),
      isDismissed: i.isDismissed,
    }));
  }
}
