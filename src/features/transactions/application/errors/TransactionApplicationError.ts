export class TransactionApplicationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'TransactionApplicationError';
    Object.setPrototypeOf(this, TransactionApplicationError.prototype);
  }
}

export class TransactionNotFoundError extends TransactionApplicationError {
  constructor(id: string) {
    super('TRANSACTION_NOT_FOUND', `Transaction with id "${id}" was not found.`);
    Object.setPrototypeOf(this, TransactionNotFoundError.prototype);
  }
}

export class SameAccountTransferError extends TransactionApplicationError {
  constructor() {
    super('SAME_SOURCE_DESTINATION_TRANSFER', 'Source account and destination account cannot be identical.');
    Object.setPrototypeOf(this, SameAccountTransferError.prototype);
  }
}

export class InvalidTransactionAmountError extends TransactionApplicationError {
  constructor(reason: string) {
    super('INVALID_TRANSACTION_AMOUNT', reason);
    Object.setPrototypeOf(this, InvalidTransactionAmountError.prototype);
  }
}
