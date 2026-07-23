import { MonetaryAmount } from '../value-objects/MonetaryAmount';

export interface BudgetSnapshot {
  readonly id: string;
  readonly limit: MonetaryAmount;
  readonly categoryId?: string; // If undefined, it is a global budget
}
