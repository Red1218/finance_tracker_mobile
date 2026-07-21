import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type ExpenseErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY'
  | 'INVALID_DATE'
  | 'FUTURE_DATE_NOT_ALLOWED'
  | 'INVALID_NOTE_LENGTH'
  | 'INVALID_MERCHANT_NAME_LENGTH'
  | 'INVALID_PAYMENT_METHOD'
  | 'EXPENSE_ALREADY_DELETED'
  | 'EXPENSE_NOT_DELETED'
  | 'ARCHIVED_CATEGORY_SELECTION';

const EXPENSE_ERROR_MAP: Record<ExpenseErrorCode, ErrorCategory> = {
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  INVALID_AMOUNT: ErrorCategory.Validation,
  INVALID_CURRENCY: ErrorCategory.Validation,
  INVALID_DATE: ErrorCategory.Validation,
  FUTURE_DATE_NOT_ALLOWED: ErrorCategory.Validation,
  INVALID_NOTE_LENGTH: ErrorCategory.Validation,
  INVALID_MERCHANT_NAME_LENGTH: ErrorCategory.Validation,
  INVALID_PAYMENT_METHOD: ErrorCategory.Validation,
  EXPENSE_ALREADY_DELETED: ErrorCategory.BusinessRule,
  EXPENSE_NOT_DELETED: ErrorCategory.BusinessRule,
  ARCHIVED_CATEGORY_SELECTION: ErrorCategory.BusinessRule,
};

export class ExpenseDomainError extends AppError {
  constructor(
    code: ExpenseErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(EXPENSE_ERROR_MAP[code], code, message, context);
    
    this.name = 'ExpenseDomainError';
    
    Object.setPrototypeOf(this, new.target.prototype);
    if (new.target === ExpenseDomainError) {
      Object.freeze(this);
    }
  }
}
