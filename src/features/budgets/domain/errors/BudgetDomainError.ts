import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type BudgetErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY'
  | 'INVALID_PERIOD_FORMAT'
  | 'INVALID_STATUS'
  | 'DUPLICATE_BUDGET';

const BUDGET_ERROR_MAP: Record<BudgetErrorCode, ErrorCategory> = {
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  INVALID_AMOUNT: ErrorCategory.Validation,
  INVALID_CURRENCY: ErrorCategory.Validation,
  INVALID_PERIOD_FORMAT: ErrorCategory.Validation,
  INVALID_STATUS: ErrorCategory.Validation,
  DUPLICATE_BUDGET: ErrorCategory.Conflict,
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
