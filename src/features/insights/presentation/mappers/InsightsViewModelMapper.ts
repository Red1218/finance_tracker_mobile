import { InsightDTO, CashFlowForecastDTO } from '../../application';
import { InsightsViewModel, InsightCardViewModel, CashFlowForecastViewModel } from '../models/InsightsViewModel';

export class InsightsViewModelMapper {
  public static toInsightCardViewModel(dto: InsightDTO): InsightCardViewModel {
    let severityColor: 'emerald' | 'amber' | 'red' | 'blue' = 'blue';
    if (dto.severity === 'HIGH' || dto.severity === 'CRITICAL') {
      severityColor = 'red';
    } else if (dto.severity === 'MEDIUM') {
      severityColor = 'amber';
    } else if (dto.severity === 'LOW') {
      severityColor = 'emerald';
    }

    const sourceLabel = dto.source === 'AI_MODEL' ? 'Gemini AI' : dto.source === 'RULE_ENGINE' ? 'Rule Engine' : 'Analytics';
    const dateObj = new Date(dto.generatedAt);
    const generatedAtFormatted = isNaN(dateObj.getTime())
      ? 'Recently'
      : dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return {
      id: dto.id,
      type: dto.type,
      severityLabel: dto.severity,
      severityColor,
      sourceLabel,
      title: dto.title,
      description: dto.description,
      recommendationText: dto.recommendationText,
      recommendationActionUrl: dto.recommendationActionUrl,
      confidencePercentage: dto.confidencePercentage,
      generatedAtFormatted,
      isDismissed: dto.isDismissed,
    };
  }

  public static toCashFlowForecastViewModel(dto: CashFlowForecastDTO): CashFlowForecastViewModel {
    const isPositiveSavings = dto.projectedSavings >= 0;
    return {
      formattedPredictedIncome: `₹${dto.predictedIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedPredictedExpense: `₹${dto.predictedExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedProjectedSavings: `₹${dto.projectedSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      confidencePercentage: dto.confidencePercentage,
      isPositiveSavings,
      forecastPeriodLabel: 'Next 30 Days Forecast',
    };
  }

  public static toFullViewModel(params: {
    insightDTOs: InsightDTO[];
    forecastDTO: CashFlowForecastDTO | null;
  }): InsightsViewModel {
    return {
      insights: params.insightDTOs.map((d) => this.toInsightCardViewModel(d)),
      forecast: params.forecastDTO ? this.toCashFlowForecastViewModel(params.forecastDTO) : null,
    };
  }
}
