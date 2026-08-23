export interface BillPaymentRow {
  id: string;
  bill_id: string;
  user_id: string;
  occurrence_key: string;
  paid_at: string;
  amount: number;
  currency_code: string;
  linked_transaction_id: string | null;
  created_at?: string;
}
