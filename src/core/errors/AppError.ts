import { ErrorCategory } from './ErrorCategory';

export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(
    category: ErrorCategory,
    code: string,
    message: string,
    context?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, cause !== undefined ? { cause } : undefined);
    
    this.name = 'AppError';
    this.category = category;
    this.code = code;
    this.context = context;
    this.cause = cause;

    Object.setPrototypeOf(this, AppError.prototype);
    Object.freeze(this);
  }
}
