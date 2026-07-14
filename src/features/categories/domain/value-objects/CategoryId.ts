import { CategoryDomainError } from '../errors/CategoryDomainError';

export class CategoryId {
  public readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new CategoryDomainError(
        'INVALID_IDENTIFIER',
        'Category ID cannot be empty.'
      );
    }
    
    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: CategoryId): boolean {
    return this.value === other.value;
  }
}
