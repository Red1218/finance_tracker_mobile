import { SupportedCurrency } from '../domain/value-objects/CurrencyCode';
import { PaymentMethodType } from '../domain/value-objects/PaymentMethod';

export interface ExpenseRow {
  id: string;
  amount: number;
  currency_code: SupportedCurrency;
  date: string;
  note: string | null;
  merchant: string | null;
  payment_method: PaymentMethodType;
  category_id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
