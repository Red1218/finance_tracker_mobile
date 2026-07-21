import { PaymentMethodType } from '../../domain';
import { ExpenseVisibility } from '../repositories/ExpenseFilter';

export interface ListExpensesRequest {
  categoryId?: string;
  startDate?: number;
  endDate?: number;
  paymentMethod?: PaymentMethodType;
  visibility?: ExpenseVisibility;
  limit?: number;
  offset?: number;
}
