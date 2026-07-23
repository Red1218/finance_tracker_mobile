export interface BudgetRow {
  id: string;
  category_id: string | null;
  amount: number;
  period: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
