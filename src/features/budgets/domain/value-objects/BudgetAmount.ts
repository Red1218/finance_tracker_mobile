import { BudgetDomainError } from '../errors/BudgetDomainError';

export class BudgetAmount {
  public readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new BudgetDomainError(
        'INVALID_AMOUNT',
        'Budget amount must be an integer representing the smallest currency unit.'
      );
    }

    if (value < 0) {
      throw new BudgetDomainError(
        'INVALID_AMOUNT',
        'Budget amount must be greater than or equal to zero.'
      );
    }

    this.value = value;
    Object.freeze(this);
  }

  public equals(other: BudgetAmount): boolean {
    return this.value === other.value;
  }
}
