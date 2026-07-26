import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type BudgetErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY'
  | 'INVALID_PERIOD_FORMAT'
  | 'INVALID_DATE_RANGE'
  | 'DUPLICATE_BUDGET'
  | 'OVERLAPPING_BUDGET'
  | 'CATEGORY_INACTIVE'
  | 'CATEGORY_MISMATCH'
  | 'HISTORICAL_BUDGET_IMMUTABLE'
  | 'BUDGET_ALREADY_ARCHIVED'
  | 'BUDGET_NOT_ARCHIVED'
  | 'BUDGET_NOT_FOUND';

const BUDGET_ERROR_MAP: Record<BudgetErrorCode, ErrorCategory> = {
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  INVALID_AMOUNT: ErrorCategory.Validation,
  INVALID_CURRENCY: ErrorCategory.Validation,
  INVALID_PERIOD_FORMAT: ErrorCategory.Validation,
  INVALID_DATE_RANGE: ErrorCategory.Validation,
  DUPLICATE_BUDGET: ErrorCategory.BusinessRule,
  OVERLAPPING_BUDGET: ErrorCategory.BusinessRule,
  CATEGORY_INACTIVE: ErrorCategory.BusinessRule,
  CATEGORY_MISMATCH: ErrorCategory.BusinessRule,
  HISTORICAL_BUDGET_IMMUTABLE: ErrorCategory.BusinessRule,
  BUDGET_ALREADY_ARCHIVED: ErrorCategory.BusinessRule,
  BUDGET_NOT_ARCHIVED: ErrorCategory.BusinessRule,
  BUDGET_NOT_FOUND: ErrorCategory.BusinessRule,
};

export class BudgetDomainError extends AppError {
  constructor(
    code: BudgetErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(BUDGET_ERROR_MAP[code], code, message, context);
    
    this.name = 'BudgetDomainError';
    
    Object.setPrototypeOf(this, new.target.prototype);
    if (new.target === BudgetDomainError) {
      Object.freeze(this);
    }
  }
}
