import { BudgetSnapshot } from '../../domain/snapshots/BudgetSnapshot';
import { CategorySnapshot } from '../../domain/snapshots/CategorySnapshot';
import { TransactionSnapshot } from '../../domain/snapshots/TransactionSnapshot';

export interface DashboardDataSnapshot {
  readonly activeReportingPeriodId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly budgets: readonly BudgetSnapshot[];
  readonly categories: readonly CategorySnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
}
