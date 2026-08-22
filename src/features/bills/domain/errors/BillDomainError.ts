export type BillDomainErrorCode =
  | 'INVALID_BILL_ID'
  | 'INVALID_BILL_PAYMENT_ID'
  | 'INVALID_BILL_NAME'
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY_CODE'
  | 'INVALID_DUE_DATE'
  | 'INVALID_RECURRENCE'
  | 'BILL_ALREADY_ARCHIVED'
  | 'BILL_NOT_ARCHIVED'
  | 'ALREADY_PAID_FOR_PERIOD'
  | 'PAYMENT_AMOUNT_MISMATCH';

export class BillDomainError extends Error {
  public readonly code: BillDomainErrorCode;

  constructor(code: BillDomainErrorCode, message: string) {
    super(message);
    this.name = 'BillDomainError';
    this.code = code;
    Object.setPrototypeOf(this, BillDomainError.prototype);
  }
}
