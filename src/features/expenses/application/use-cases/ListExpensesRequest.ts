import { PaymentMethodType } from '../../domain';

export interface ListExpensesRequest {
  categoryId?: string;
  startDate?: number;
  endDate?: number;
  paymentMethod?: PaymentMethodType;
  limit?: number;
  offset?: number;
}
