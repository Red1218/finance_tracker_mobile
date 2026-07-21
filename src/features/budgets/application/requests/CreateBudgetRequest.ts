export interface CreateBudgetRequest {
  readonly categoryId: string | null;
  readonly amount: number;
  readonly currencyCode: string;
  readonly period: string;
  readonly startDate: Date;
  readonly endDate: Date;
}
