import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export class ExpenseNote {
  public readonly value: string;
  private static readonly MAX_LENGTH = 500;

  constructor(value?: string) {
    const trimmed = value ? value.trim() : '';

    if (trimmed.length > ExpenseNote.MAX_LENGTH) {
      throw new ExpenseDomainError(
        'INVALID_NOTE_LENGTH',
        `Expense note cannot exceed ${ExpenseNote.MAX_LENGTH} characters.`
      );
    }

    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: ExpenseNote): boolean {
    return this.value === other.value;
  }
}
