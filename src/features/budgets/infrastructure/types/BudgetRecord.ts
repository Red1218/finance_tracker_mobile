export interface BudgetRecord {
  id: string;
  category_id: string | null;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
}
