export interface BudgetRow {
  id: string;
  user_id?: string;
  category_id: string | null;
  amount: number;
  currency_code: string;
  period_kind: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
}
