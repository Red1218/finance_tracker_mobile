import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type CategoryErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_IDENTIFIER'
  | 'PROTECTED_CATEGORY_MODIFICATION';

const CATEGORY_ERROR_MAP: Record<CategoryErrorCode, ErrorCategory> = {
  INVALID_NAME: ErrorCategory.Validation,
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  PROTECTED_CATEGORY_MODIFICATION: ErrorCategory.BusinessRule,
};

export class CategoryDomainError extends AppError {
  constructor(
    code: CategoryErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(CATEGORY_ERROR_MAP[code], code, message, context);
    
    this.name = 'CategoryDomainError';
    
    Object.setPrototypeOf(this, new.target.prototype);
    if (new.target === CategoryDomainError) {
      Object.freeze(this);
    }
  }
}
