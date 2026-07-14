import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export class ExpenseDate {
  public readonly value: number; // immutable timestamp representation

  constructor(value: Date | string | number) {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new ExpenseDomainError(
        'INVALID_DATE',
        'Provided expense date is invalid.'
      );
    }

    // Business Rule: Expense date cannot be in the future.
    // Implementation: Compare calendar dates (ignoring time components) 
    // to allow expenses recorded at any time on the current day.
    const now = new Date();
    const expenseCalendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const currentCalendarDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (expenseCalendarDate.getTime() > currentCalendarDate.getTime()) {
      throw new ExpenseDomainError(
        'FUTURE_DATE_NOT_ALLOWED',
        'Expense date cannot be in the future.'
      );
    }

    this.value = date.getTime();
    Object.freeze(this);
  }

  public equals(other: ExpenseDate): boolean {
    return this.value === other.value;
  }
}
