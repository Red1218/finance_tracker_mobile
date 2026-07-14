import { CategoryDomainError } from '../errors/CategoryDomainError';

export class CategoryName {
  public readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new CategoryDomainError(
        'INVALID_NAME',
        'Category name cannot be empty or consist only of whitespace.'
      );
    }
    
    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: CategoryName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
