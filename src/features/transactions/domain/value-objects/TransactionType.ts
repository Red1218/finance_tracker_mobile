import { TransactionDomainError } from '../errors/TransactionDomainError';

export enum TransactionTypeKind {
  Expense = 'EXPENSE',
  Income = 'INCOME',
  TransferOut = 'TRANSFER_OUT',
  TransferIn = 'TRANSFER_IN',
}

export class TransactionType {
  public readonly kind: TransactionTypeKind;

  constructor(kind: TransactionTypeKind | string) {
    const uppercaseKind = typeof kind === 'string' ? kind.trim().toUpperCase() : kind;

    if (!Object.values(TransactionTypeKind).includes(uppercaseKind as TransactionTypeKind)) {
      throw new TransactionDomainError(
        'INVALID_TRANSACTION_TYPE',
        `Invalid transaction type "${kind}". Must be EXPENSE, INCOME, TRANSFER_OUT, or TRANSFER_IN.`
      );
    }

    this.kind = uppercaseKind as TransactionTypeKind;
    Object.freeze(this);
  }

  public isExpense(): boolean {
    return this.kind === TransactionTypeKind.Expense;
  }

  public isIncome(): boolean {
    return this.kind === TransactionTypeKind.Income;
  }

  public isTransferOut(): boolean {
    return this.kind === TransactionTypeKind.TransferOut;
  }

  public isTransferIn(): boolean {
    return this.kind === TransactionTypeKind.TransferIn;
  }

  public isTransfer(): boolean {
    return this.isTransferOut() || this.isTransferIn();
  }

  public equals(other: TransactionType): boolean {
    return this.kind === other.kind;
  }
}
