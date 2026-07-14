import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export class ExpenseAmount {
  public readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new ExpenseDomainError(
        'INVALID_AMOUNT',
        'Expense amount must be an integer representing the smallest currency unit.'
      );
    }

    if (value <= 0) {
      throw new ExpenseDomainError(
        'INVALID_AMOUNT',
        'Expense amount must be greater than zero.'
      );
    }

    this.value = value;
    Object.freeze(this);
  }

  public equals(other: ExpenseAmount): boolean {
    return this.value === other.value;
  }
}
