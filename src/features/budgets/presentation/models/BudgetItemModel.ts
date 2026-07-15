export interface BudgetItemModel {
  id: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  formattedAmount: string;
  period: string;
  status: string;
}
