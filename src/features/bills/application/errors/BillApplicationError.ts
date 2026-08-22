export type BillApplicationErrorCode =
  | 'BILL_NOT_FOUND'
  | 'BILL_ALREADY_ARCHIVED'
  | 'ALREADY_PAID_FOR_PERIOD'
  | 'PAYMENT_AMOUNT_MISMATCH'
  | 'TRANSACTION_INTEGRATION_FAILED'
  | 'TRANSACTION_NOT_FOUND'
  | 'INVALID_EXECUTION_MODE'
  | 'REPOSITORY_ERROR';

export class BillApplicationError extends Error {
  public readonly code: BillApplicationErrorCode;

  constructor(code: BillApplicationErrorCode, message: string) {
    super(message);
    this.name = 'BillApplicationError';
    this.code = code;
    Object.setPrototypeOf(this, BillApplicationError.prototype);
  }
}
