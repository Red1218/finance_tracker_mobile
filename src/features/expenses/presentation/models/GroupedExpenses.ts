import { ExpenseItemModel } from './ExpenseItemModel';

export interface GroupedExpenses {
  dateHeader: string;
  data: ExpenseItemModel[];
}
