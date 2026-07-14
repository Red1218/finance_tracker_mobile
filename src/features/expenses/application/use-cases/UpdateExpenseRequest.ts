import { PaymentMethodType } from '../../domain';

export interface UpdateExpenseRequest {
  id: string;
  categoryId?: string;
  amount?: number;
  currency?: string;
  date?: number;
  paymentMethod?: PaymentMethodType;
  note?: string | null;
  merchant?: string | null;
}
