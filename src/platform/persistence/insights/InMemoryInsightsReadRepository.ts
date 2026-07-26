import { IInsightsReadRepository } from '../../../features/insights/application';
import { Insight } from '../../../features/insights/domain';

export class InMemoryInsightsReadRepository implements IInsightsReadRepository {
  private insights: Map<string, Insight> = new Map();

  public async getInsights(): Promise<Insight[]> {
    return Array.from(this.insights.values());
  }

  public async getInsightById(id: string): Promise<Insight | null> {
    return this.insights.get(id) ?? null;
  }

  public async saveInsight(insight: Insight): Promise<void> {
    this.insights.set(insight.id, insight);
  }

  public async updateInsight(insight: Insight): Promise<void> {
    this.insights.set(insight.id, insight);
  }
}
