export interface DashboardSummaryResponse {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netCashFlow: number;
  readonly savingsRate: number;
  readonly transactionCount: number;
}
