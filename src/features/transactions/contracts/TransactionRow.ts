export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  amount: number;
  currency_code: string;
  description: string | null;
  transfer_group_id: string | null;
  transaction_date?: string; // ISO string
  occurred_at?: string; // ISO string
  created_at: string; // ISO string
  updated_at: string; // ISO string
  voided_at?: string | null; // ISO string
  archived_at?: string | null; // ISO string

}
