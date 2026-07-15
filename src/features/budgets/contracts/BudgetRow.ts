import { SupportedCurrency } from '../../expenses/domain/value-objects/CurrencyCode';
import { BudgetStatusValue } from '../domain/value-objects/BudgetStatus';

export interface BudgetRow {
  id: string;
  category_id: string | null;
  amount: number;
  currency_code: SupportedCurrency;
  period: string;
  status: BudgetStatusValue;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
