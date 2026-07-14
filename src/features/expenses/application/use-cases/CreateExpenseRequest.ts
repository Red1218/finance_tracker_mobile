import { PaymentMethodType } from '../../domain';

export interface CreateExpenseRequest {
  categoryId: string;
  amount: number;
  currency: string;
  date: number;
  paymentMethod: PaymentMethodType;
  note?: string;
  merchant?: string;
}
