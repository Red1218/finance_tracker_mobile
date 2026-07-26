import { AppError } from '../../../../core/errors/AppError';
import { ErrorCategory } from '../../../../core/errors/ErrorCategory';

export type PreferencesErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_THEME'
  | 'INVALID_CURRENCY_CODE'
  | 'INVALID_WEEK_START'
  | 'INVALID_DECIMAL_PRECISION'
  | 'INVALID_REMINDER_TIME'
  | 'INVALID_NOTIFICATION_SETTINGS'
  | 'INVALID_DEFAULT_CATEGORY';

const PREFERENCES_ERROR_MAP: Record<PreferencesErrorCode, ErrorCategory> = {
  INVALID_IDENTIFIER: ErrorCategory.Validation,
  INVALID_THEME: ErrorCategory.Validation,
  INVALID_CURRENCY_CODE: ErrorCategory.Validation,
  INVALID_WEEK_START: ErrorCategory.Validation,
  INVALID_DECIMAL_PRECISION: ErrorCategory.Validation,
  INVALID_REMINDER_TIME: ErrorCategory.Validation,
  INVALID_NOTIFICATION_SETTINGS: ErrorCategory.BusinessRule,
  INVALID_DEFAULT_CATEGORY: ErrorCategory.BusinessRule,
};

export class PreferencesDomainError extends AppError {
  constructor(
    code: PreferencesErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(PREFERENCES_ERROR_MAP[code], code, message, context);

    this.name = 'PreferencesDomainError';

    Object.setPrototypeOf(this, new.target.prototype);
    if (new.target === PreferencesDomainError) {
      Object.freeze(this);
    }
  }
}
