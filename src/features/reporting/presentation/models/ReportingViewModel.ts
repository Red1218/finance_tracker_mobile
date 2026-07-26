export interface FinancialSummaryCardViewModel {
  formattedIncome: string;
  formattedExpense: string;
  formattedNetSavings: string;
  savingsRatePercentage: number;
  isPositiveSavings: boolean;
}

export interface CategoryBreakdownItemViewModel {
  categoryId: string;
  categoryName: string;
  formattedAmount: string;
  percentage: number;
}

export interface MonthlyTrendItemViewModel {
  periodLabel: string;
  formattedIncome: string;
  formattedExpense: string;
  formattedNet: string;
}

export interface ReportingViewModel {
  selectedPeriod: string;
  financialSummary: FinancialSummaryCardViewModel | null;
  categoryBreakdown: CategoryBreakdownItemViewModel[];
  monthlyTrend: MonthlyTrendItemViewModel[];
}
