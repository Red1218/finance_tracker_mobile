import { BudgetDomainError } from '../errors/BudgetDomainError';

export type BudgetStatusValue = 'Active' | 'Inactive';

export class BudgetStatus {
  public readonly value: BudgetStatusValue;

  constructor(value: string) {
    if (value !== 'Active' && value !== 'Inactive') {
      throw new BudgetDomainError(
        'INVALID_STATUS',
        'Budget status must be Active or Inactive.'
      );
    }

    this.value = value as BudgetStatusValue;
    Object.freeze(this);
  }

  public isActive(): boolean {
    return this.value === 'Active';
  }

  public equals(other: BudgetStatus): boolean {
    return this.value === other.value;
  }
}
