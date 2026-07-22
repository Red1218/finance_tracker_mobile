export const reportingKeys = {
  all: ['reporting'] as const,
  dashboardSummary: (period: string, start?: string, end?: string) =>
    [...reportingKeys.all, 'dashboardSummary', period, start, end] as const,
  categoryBreakdown: (period: string, start?: string, end?: string) =>
    [...reportingKeys.all, 'categoryBreakdown', period, start, end] as const,
  monthlyTrend: (period: string, start?: string, end?: string) =>
    [...reportingKeys.all, 'monthlyTrend', period, start, end] as const,
  budgetPerformance: (period: string, start?: string, end?: string) =>
    [...reportingKeys.all, 'budgetPerformance', period, start, end] as const,
  largestTransactions: (period: string, start?: string, end?: string) =>
    [...reportingKeys.all, 'largestTransactions', period, start, end] as const,
};
