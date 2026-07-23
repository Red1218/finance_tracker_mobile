import { MonetaryAmount } from '../value-objects/MonetaryAmount';

export interface TransactionSnapshot {
  readonly id: string;
  readonly amount: MonetaryAmount;
  readonly direction: 'Income' | 'Expense';
  readonly occurredAt: Date;
  readonly categoryId: string;
  readonly description: string;
}
