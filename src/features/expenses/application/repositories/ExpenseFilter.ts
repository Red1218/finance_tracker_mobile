import { CategoryId } from '../../../categories/domain';
import { PaymentMethodType } from '../../domain';

export interface ExpenseFilter {
  categoryId?: CategoryId;
  startDate?: number;
  endDate?: number;
  paymentMethod?: PaymentMethodType;
}
