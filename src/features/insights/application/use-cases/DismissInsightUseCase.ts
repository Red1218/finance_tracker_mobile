import { InsightDomainError } from '../../domain';
import { IInsightsReadRepository } from '../repositories/IInsightsReadRepository';

export class DismissInsightUseCase {
  constructor(private readonly insightsRepo: IInsightsReadRepository) {
    Object.freeze(this);
  }

  public async execute(insightId: string): Promise<boolean> {
    const insight = await this.insightsRepo.getInsightById(insightId);
    if (!insight) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', `Insight ${insightId} not found.`);
    }

    insight.dismiss();
    await this.insightsRepo.updateInsight(insight);
    return true;
  }
}
