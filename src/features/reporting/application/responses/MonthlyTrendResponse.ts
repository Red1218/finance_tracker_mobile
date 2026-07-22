export interface MonthlyTrendPointItem {
  readonly period: string;
  readonly income: number;
  readonly expenses: number;
  readonly netCashFlow: number;
}

export interface MonthlyTrendResponse {
  readonly items: readonly MonthlyTrendPointItem[];
}
