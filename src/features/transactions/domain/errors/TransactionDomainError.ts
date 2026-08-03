export type TransactionErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_CURRENCY_CODE'
  | 'SAME_SOURCE_DESTINATION_TRANSFER'
  | 'ARCHIVED_ACCOUNT_TRANSACTION_REJECTED'
  | 'INVALID_TRANSACTION_TYPE'
  | 'IMMUTABLE_FIELD_MODIFICATION'
  | 'TRANSACTION_NOT_FOUND'
  | 'INVALID_DESCRIPTION'
  | 'TRANSACTION_ALREADY_ARCHIVED'
  | 'TRANSACTION_NOT_ARCHIVED';

export class TransactionDomainError extends Error {
  public readonly code: TransactionErrorCode;

  constructor(code: TransactionErrorCode, message: string) {
    super(message);
    this.name = 'TransactionDomainError';
    this.code = code;
    Object.setPrototypeOf(this, TransactionDomainError.prototype);
  }
}
