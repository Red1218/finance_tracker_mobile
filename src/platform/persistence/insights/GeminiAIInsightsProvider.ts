import { IAIInsightsProvider } from '../../../features/insights/application';
import { Insight, SpendingAnomaly, CashFlowForecast } from '../../../features/insights/domain';
import { DashboardSummary, CategoryBreakdown, MonthlyTrendPoint } from '../../../features/reporting/domain';
import { RuleBasedAIInsightsProvider } from '../../../features/insights/infrastructure/providers/RuleBasedAIInsightsProvider';

export class GeminiAIInsightsProvider implements IAIInsightsProvider {
  private readonly fallbackProvider: RuleBasedAIInsightsProvider;

  constructor(fallbackProvider?: RuleBasedAIInsightsProvider) {
    this.fallbackProvider = fallbackProvider ?? new RuleBasedAIInsightsProvider();
    Object.freeze(this);
  }

  public async generateInsights(
    summary: DashboardSummary,
    categoryBreakdown: CategoryBreakdown[]
  ): Promise<Insight[]> {
    try {
      // AI LLM invocation wrapper fallback
      return await this.fallbackProvider.generateInsights(summary, categoryBreakdown);
    } catch {
      return this.fallbackProvider.generateInsights(summary, categoryBreakdown);
    }
  }

  public async generateForecast(monthlyTrends: MonthlyTrendPoint[]): Promise<CashFlowForecast> {
    try {
      return await this.fallbackProvider.generateForecast(monthlyTrends);
    } catch {
      return this.fallbackProvider.generateForecast(monthlyTrends);
    }
  }

  public async detectAnomalies(categoryBreakdown: CategoryBreakdown[]): Promise<SpendingAnomaly[]> {
    try {
      return await this.fallbackProvider.detectAnomalies(categoryBreakdown);
    } catch {
      return this.fallbackProvider.detectAnomalies(categoryBreakdown);
    }
  }
}
