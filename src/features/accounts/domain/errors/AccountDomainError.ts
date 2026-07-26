import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type AccountErrorCode =
  | 'INVALID_ACCOUNT_ID'
  | 'INVALID_ACCOUNT_NAME'
  | 'INVALID_ACCOUNT_TYPE'
  | 'INVALID_CURRENCY_CODE'
  | 'INVALID_OPENING_BALANCE'
  | 'LAST_ACTIVE_ACCOUNT_ARCHIVE'
  | 'ARCHIVED_ACCOUNT_MODIFICATION'
  | 'DUPLICATE_ACCOUNT_NAME';

const ACCOUNT_ERROR_MAP: Record<AccountErrorCode, ErrorCategory> = {
  INVALID_ACCOUNT_ID: ErrorCategory.Validation,
  INVALID_ACCOUNT_NAME: ErrorCategory.Validation,
  INVALID_ACCOUNT_TYPE: ErrorCategory.Validation,
  INVALID_CURRENCY_CODE: ErrorCategory.Validation,
  INVALID_OPENING_BALANCE: ErrorCategory.Validation,
  LAST_ACTIVE_ACCOUNT_ARCHIVE: ErrorCategory.BusinessRule,
  ARCHIVED_ACCOUNT_MODIFICATION: ErrorCategory.BusinessRule,
  DUPLICATE_ACCOUNT_NAME: ErrorCategory.BusinessRule,
};

export class AccountDomainError extends AppError {
  constructor(
    code: AccountErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(ACCOUNT_ERROR_MAP[code], code, message, context);

    this.name = 'AccountDomainError';

    Object.setPrototypeOf(this, new.target.prototype);
    if (new.target === AccountDomainError) {
      Object.freeze(this);
    }
  }
}
