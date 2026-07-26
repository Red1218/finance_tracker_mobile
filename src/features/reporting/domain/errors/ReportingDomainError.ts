export type ReportingDomainErrorCode =
  | 'INVALID_REPORTING_PERIOD'
  | 'NO_TRANSACTION_DATA'
  | 'INSUFFICIENT_DATA';

export class ReportingDomainError extends Error {
  public readonly code: ReportingDomainErrorCode;

  constructor(code: ReportingDomainErrorCode, message: string) {
    super(message);
    this.name = 'ReportingDomainError';
    this.code = code;
    Object.setPrototypeOf(this, ReportingDomainError.prototype);
  }
}
