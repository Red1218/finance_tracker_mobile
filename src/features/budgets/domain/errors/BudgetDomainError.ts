import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type BudgetErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY'
  | 'INVALID_PERIOD_FORMAT'
  | 'INVALID_DATE_RANGE'
  | 'DUPLICATE_BUDGET'
  | 'CATEGORY_INACTIVE'
  | 'CATEGORY_MISMATCH'
  | 'HISTORICAL_BUDGET_IMMUTABLE';

const BUDGET_ERROR_MAP: Record<BudgetErrorCode, ErrorCategory> = {
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  INVALID_AMOUNT: ErrorCategory.Validation,
  INVALID_CURRENCY: ErrorCategory.Validation,
  INVALID_PERIOD_FORMAT: ErrorCategory.Validation,
  INVALID_DATE_RANGE: ErrorCategory.Validation,
  DUPLICATE_BUDGET: ErrorCategory.Conflict,
  CATEGORY_INACTIVE: ErrorCategory.Validation,
  CATEGORY_MISMATCH: ErrorCategory.Validation,
  HISTORICAL_BUDGET_IMMUTABLE: ErrorCategory.Validation,
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
