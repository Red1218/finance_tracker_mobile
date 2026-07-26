import { Insight } from '../../domain';

export interface IInsightsReadRepository {
  getInsights(): Promise<Insight[]>;
  getInsightById(id: string): Promise<Insight | null>;
  saveInsight(insight: Insight): Promise<void>;
  updateInsight(insight: Insight): Promise<void>;
}
