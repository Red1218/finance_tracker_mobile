import { BudgetPeriod, BudgetStatus } from '../../domain';
import { CategoryId } from '../../../categories/domain';

export interface BudgetFilter {
  period?: BudgetPeriod;
  categoryId?: CategoryId | null;
  status?: BudgetStatus;
  includeDeleted?: boolean;
}
