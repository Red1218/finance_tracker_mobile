export interface InsightCardViewModel {
  id: string;
  type: string;
  severityLabel: string;
  severityColor: 'emerald' | 'amber' | 'red' | 'blue';
  sourceLabel: string;
  title: string;
  description: string;
  recommendationText: string | null;
  recommendationActionUrl: string | null;
  confidencePercentage: number;
  generatedAtFormatted: string;
  isDismissed: boolean;
}

export interface CashFlowForecastViewModel {
  formattedPredictedIncome: string;
  formattedPredictedExpense: string;
  formattedProjectedSavings: string;
  confidencePercentage: number;
  isPositiveSavings: boolean;
  forecastPeriodLabel: string;
}

export interface InsightsViewModel {
  insights: InsightCardViewModel[];
  forecast: CashFlowForecastViewModel | null;
}
