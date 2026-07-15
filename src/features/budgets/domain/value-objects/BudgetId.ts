import { BudgetDomainError } from '../errors/BudgetDomainError';

export class BudgetId {
  public readonly value: string;
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(value: string) {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new BudgetDomainError(
        'INVALID_IDENTIFIER',
        'Budget ID cannot be empty.'
      );
    }
    
    if (!BudgetId.UUID_REGEX.test(trimmed)) {
      throw new BudgetDomainError(
        'INVALID_IDENTIFIER',
        'Budget ID must be a valid UUID.'
      );
    }
    
    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: BudgetId): boolean {
    return this.value === other.value;
  }
}
