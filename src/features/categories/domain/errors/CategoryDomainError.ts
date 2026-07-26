import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type CategoryErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_IDENTIFIER'
  | 'SYSTEM_CATEGORY_MODIFICATION'
  | 'PROTECTED_CATEGORY_MODIFICATION'
  | 'CATEGORY_ALREADY_ARCHIVED'
  | 'CATEGORY_NOT_ARCHIVED'
  | 'DUPLICATE_CATEGORY_NAME'
  | 'ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED'
  | 'CATEGORY_NOT_FOUND';

const CATEGORY_ERROR_MAP: Record<CategoryErrorCode, ErrorCategory> = {
  INVALID_NAME: ErrorCategory.Validation,
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  SYSTEM_CATEGORY_MODIFICATION: ErrorCategory.BusinessRule,
  PROTECTED_CATEGORY_MODIFICATION: ErrorCategory.BusinessRule,
  CATEGORY_ALREADY_ARCHIVED: ErrorCategory.BusinessRule,
  CATEGORY_NOT_ARCHIVED: ErrorCategory.BusinessRule,
  DUPLICATE_CATEGORY_NAME: ErrorCategory.BusinessRule,
  ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED: ErrorCategory.BusinessRule,
  CATEGORY_NOT_FOUND: ErrorCategory.BusinessRule,
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
