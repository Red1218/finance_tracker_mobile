export interface AccountRow {
  id: string;
  user_id: string | null;
  name: string;
  type: string;
  currency_code: string;
  opening_balance: number;
  is_default: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}
