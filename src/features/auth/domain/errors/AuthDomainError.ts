export type AuthDomainErrorCode =
  | 'INVALID_USER_ID'
  | 'INVALID_EMAIL'
  | 'EXPIRED_SESSION'
  | 'UNAUTHENTICATED_ACCESS'
  | 'INVALID_STATUS_TRANSITION';

export class AuthDomainError extends Error {
  public readonly code: AuthDomainErrorCode;

  constructor(code: AuthDomainErrorCode, message: string) {
    super(message);
    this.name = 'AuthDomainError';
    this.code = code;
    Object.setPrototypeOf(this, AuthDomainError.prototype);
  }
}
