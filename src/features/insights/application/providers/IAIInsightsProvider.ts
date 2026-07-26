import { Insight, SpendingAnomaly, CashFlowForecast } from '../../domain';
import { DashboardSummary, CategoryBreakdown, MonthlyTrendPoint } from '../../../reporting/domain';

export interface IAIInsightsProvider {
  generateInsights(
    summary: DashboardSummary,
    categoryBreakdown: CategoryBreakdown[]
  ): Promise<Insight[]>;

  generateForecast(
    monthlyTrends: MonthlyTrendPoint[]
  ): Promise<CashFlowForecast>;

  detectAnomalies(
    categoryBreakdown: CategoryBreakdown[]
  ): Promise<SpendingAnomaly[]>;
}
