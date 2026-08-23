export interface BillRow {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  amount: number;
  currency_code: string;
  recurrence_kind: string;
  anchor_day_of_month: number;
  next_due_date: string;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
}
