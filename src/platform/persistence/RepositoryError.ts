import { AppError } from '../../core/errors/AppError';
import { ErrorCategory } from '../../core/errors/ErrorCategory';

export type RepositoryErrorCode = 
  | 'NOT_FOUND'
  | 'UNIQUE_VIOLATION'
  | 'CONNECTION_FAILED'
  | 'UNKNOWN_PERSISTENCE_ERROR';

const ERROR_CATEGORY_MAP: Record<RepositoryErrorCode, ErrorCategory> = {
  NOT_FOUND: ErrorCategory.Permanent,
  UNIQUE_VIOLATION: ErrorCategory.Conflict,
  CONNECTION_FAILED: ErrorCategory.Transient,
  UNKNOWN_PERSISTENCE_ERROR: ErrorCategory.Permanent,
};

export class RepositoryError extends AppError {
  constructor(
    code: RepositoryErrorCode,
    message: string,
    context?: Record<string, unknown>,
    cause?: unknown
  ) {
    const category = ERROR_CATEGORY_MAP[code];
    
    super(category, code, message, context, cause);
    
    this.name = 'RepositoryError';
    
    Object.setPrototypeOf(this, RepositoryError.prototype);
    Object.freeze(this);
  }
}
