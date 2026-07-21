import { CategoryId } from '../../../categories/domain';
import { PaymentMethodType } from '../../domain';

export type ExpenseVisibility = 'active' | 'deleted' | 'all';

export interface ExpenseFilter {
  categoryId?: CategoryId;
  startDate?: number;
  endDate?: number;
  paymentMethod?: PaymentMethodType;
  visibility?: ExpenseVisibility;
}
