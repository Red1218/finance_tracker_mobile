export type InsightDomainErrorCode =
  | 'INSUFFICIENT_HISTORICAL_DATA'
  | 'INVALID_CONFIDENCE_SCORE'
  | 'INVALID_INSIGHT_STATE';

export class InsightDomainError extends Error {
  public readonly code: InsightDomainErrorCode;

  constructor(code: InsightDomainErrorCode, message: string) {
    super(message);
    this.name = 'InsightDomainError';
    this.code = code;
    Object.setPrototypeOf(this, InsightDomainError.prototype);
  }
}
