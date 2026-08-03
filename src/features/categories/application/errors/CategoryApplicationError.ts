import { CategoryDomainError } from '../../domain';

export class CategoryApplicationError extends CategoryDomainError {
  constructor(code: string, message: string) {
    super(code as any, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CategoryNotFoundError extends CategoryApplicationError {
  constructor(categoryId: string) {
    super('CATEGORY_NOT_FOUND', `Category with ID "${categoryId}" was not found.`);
  }
}

export class CategoryMismatchError extends CategoryApplicationError {
  constructor(expectedKind: string, actualKind: string) {
    super('CATEGORY_MISMATCH', `Expected category kind "${expectedKind}", but got "${actualKind}".`);
  }
}

export class SystemCategoryMutationError extends CategoryApplicationError {
  constructor(action: string) {
    super('SYSTEM_CATEGORY_IMMUTABLE', `System categories cannot be ${action}.`);
  }
}

export class DuplicateCategoryNameError extends CategoryApplicationError {
  constructor(name: string) {
    super('DUPLICATE_CATEGORY_NAME', `An active category named "${name}" already exists.`);
  }
}
