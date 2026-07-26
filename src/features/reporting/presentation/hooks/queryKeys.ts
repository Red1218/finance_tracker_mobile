export const reportingKeys = {
  all: ['reporting'] as const,
  dashboardSummary: (period: string, start?: string, end?: string, categoryId?: string | null) =>
    [...reportingKeys.all, 'dashboardSummary', period, start, end, categoryId] as const,
  categoryBreakdown: (period: string, start?: string, end?: string, categoryId?: string | null) =>
    [...reportingKeys.all, 'categoryBreakdown', period, start, end, categoryId] as const,
  monthlyTrend: (period: string, start?: string, end?: string, categoryId?: string | null) =>
    [...reportingKeys.all, 'monthlyTrend', period, start, end, categoryId] as const,
  budgetPerformance: (period: string, start?: string, end?: string, categoryId?: string | null) =>
    [...reportingKeys.all, 'budgetPerformance', period, start, end, categoryId] as const,
  largestTransactions: (period: string, start?: string, end?: string, categoryId?: string | null) =>
    [...reportingKeys.all, 'largestTransactions', period, start, end, categoryId] as const,
};
