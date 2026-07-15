export interface CreateBudgetRequest {
  categoryId?: string | null;
  amount: number;
  currency: string;
  period: string;
}
