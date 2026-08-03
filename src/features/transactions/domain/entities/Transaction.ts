import { AccountId, CurrencyCode } from '../../../accounts/domain';
import {
  TransactionId,
  Money,
  TransactionType,
  TransactionTypeKind,
  TransactionDate,
  TransactionDescription,
  TransferReference,
} from '../value-objects';
import { TransactionDomainError } from '../errors/TransactionDomainError';

export interface TransactionProps {
  id: TransactionId;
  accountId: AccountId;
  categoryId?: string | null;
  type: TransactionType;
  amount: Money;
  currencyCode: CurrencyCode;
  description: TransactionDescription;
  transferGroupId?: TransferReference | null;
  transactionDate?: TransactionDate;
  occurredAt?: Date;
  createdAt?: Date;
  archivedAt?: Date | null;
  voidedAt?: Date | null;
}

export class Transaction {
  public readonly id: TransactionId;
  public readonly accountId: AccountId;
  public readonly categoryId: string | null;
  public readonly type: TransactionType;
  public readonly amount: Money;
  public readonly currencyCode: CurrencyCode;
  public readonly description: TransactionDescription;
  public readonly transferGroupId: TransferReference | null;
  public readonly transactionDate: TransactionDate;
  public readonly createdAt: Date;
  public readonly archivedAt: Date | null;
  public readonly voidedAt: Date | null;

  constructor(props: TransactionProps) {
    if (props.type.isTransfer() && !props.transferGroupId) {
      throw new TransactionDomainError(
        'INVALID_TRANSACTION_TYPE',
        'Transfer ledger entries require a valid transfer group ID.'
      );
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId ?? null;
    this.type = props.type;
    this.amount = props.amount;
    this.currencyCode = props.currencyCode;
    this.description = props.description;
    this.transferGroupId = props.transferGroupId ?? null;
    
    const rawOccurredAt = props.occurredAt ?? (props.transactionDate ? props.transactionDate.value : new Date());
    this.transactionDate = props.transactionDate ?? new TransactionDate(rawOccurredAt);
    this.createdAt = props.createdAt ?? new Date();
    this.archivedAt = props.archivedAt ?? null;
    this.voidedAt = props.voidedAt ?? null;

    Object.freeze(this);
  }

  public get occurredAt(): Date {
    return this.transactionDate.value;
  }

  public get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  public archive(archivedAt: Date = new Date()): Transaction {
    if (this.isArchived) {
      throw new TransactionDomainError('TRANSACTION_ALREADY_ARCHIVED', 'Transaction is already archived.');
    }
    return new Transaction({
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      type: this.type,
      amount: this.amount,
      currencyCode: this.currencyCode,
      description: this.description,
      transferGroupId: this.transferGroupId,
      transactionDate: this.transactionDate,
      createdAt: this.createdAt,
      archivedAt,
      voidedAt: this.voidedAt,
    });
  }

  public restore(): Transaction {
    if (!this.isArchived) {
      throw new TransactionDomainError('TRANSACTION_NOT_ARCHIVED', 'Transaction is not archived.');
    }
    return new Transaction({
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      type: this.type,
      amount: this.amount,
      currencyCode: this.currencyCode,
      description: this.description,
      transferGroupId: this.transferGroupId,
      transactionDate: this.transactionDate,
      createdAt: this.createdAt,
      archivedAt: null,
      voidedAt: this.voidedAt,
    });
  }

  public get isVoided(): boolean {
    return this.voidedAt !== null;
  }

  public updateDetails(updates: {
    amount?: Money;
    description?: TransactionDescription;
    transactionDate?: TransactionDate;
    categoryId?: string | null;
  }): Transaction {
    if (this.isVoided) {
      throw new TransactionDomainError('INVALID_AMOUNT', 'Cannot modify a voided transaction.');
    }

    return new Transaction({
      id: this.id,
      accountId: this.accountId,
      categoryId: updates.categoryId !== undefined ? updates.categoryId : this.categoryId,
      type: this.type,
      amount: updates.amount ?? this.amount,
      currencyCode: this.currencyCode,
      description: updates.description ?? this.description,
      transferGroupId: this.transferGroupId,
      transactionDate: updates.transactionDate ?? this.transactionDate,
      createdAt: this.createdAt,
      voidedAt: this.voidedAt,
    });
  }

  public voidTransaction(voidedAt: Date = new Date()): Transaction {
    if (this.isVoided) return this;
    return new Transaction({
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      type: this.type,
      amount: this.amount,
      currencyCode: this.currencyCode,
      description: this.description,
      transferGroupId: this.transferGroupId,
      transactionDate: this.transactionDate,
      createdAt: this.createdAt,
      archivedAt: this.archivedAt,
      voidedAt,
    });
  }

  public unvoidTransaction(): Transaction {
    if (!this.isVoided) return this;
    return new Transaction({
      id: this.id,
      accountId: this.accountId,
      categoryId: this.categoryId,
      type: this.type,
      amount: this.amount,
      currencyCode: this.currencyCode,
      description: this.description,
      transferGroupId: this.transferGroupId,
      transactionDate: this.transactionDate,
      createdAt: this.createdAt,
      archivedAt: this.archivedAt,
      voidedAt: null,
    });
  }

  public static createExpense(props: {
    id: TransactionId;
    accountId: AccountId;
    amount: Money;
    currencyCode: CurrencyCode;
    description: TransactionDescription;
    categoryId?: string | null;
    transactionDate?: TransactionDate;
    occurredAt?: Date;
  }): Transaction {
    return new Transaction({
      id: props.id,
      accountId: props.accountId,
      type: new TransactionType(TransactionTypeKind.Expense),
      amount: props.amount,
      currencyCode: props.currencyCode,
      description: props.description,
      categoryId: props.categoryId,
      transactionDate: props.transactionDate,
      occurredAt: props.occurredAt,
    });
  }

  public static createIncome(props: {
    id: TransactionId;
    accountId: AccountId;
    amount: Money;
    currencyCode: CurrencyCode;
    description: TransactionDescription;
    categoryId?: string | null;
    transactionDate?: TransactionDate;
    occurredAt?: Date;
  }): Transaction {
    return new Transaction({
      id: props.id,
      accountId: props.accountId,
      type: new TransactionType(TransactionTypeKind.Income),
      amount: props.amount,
      currencyCode: props.currencyCode,
      description: props.description,
      categoryId: props.categoryId,
      transactionDate: props.transactionDate,
      occurredAt: props.occurredAt,
    });
  }

  public static createTransferPair(props: {
    sourceTransactionId: TransactionId;
    destTransactionId: TransactionId;
    sourceAccountId: AccountId;
    destAccountId: AccountId;
    amount: Money;
    currencyCode: CurrencyCode;
    description: TransactionDescription;
    transferGroupId: TransferReference;
    transactionDate?: TransactionDate;
  }): { sourceEntry: Transaction; destEntry: Transaction } {
    if (props.sourceAccountId.equals(props.destAccountId)) {
      throw new TransactionDomainError(
        'SAME_SOURCE_DESTINATION_TRANSFER',
        'Source account and destination account cannot be identical.'
      );
    }

    const tDate = props.transactionDate ?? new TransactionDate();

    // Source entry (Outward transfer / Debit from source account)
    const sourceEntry = new Transaction({
      id: props.sourceTransactionId,
      accountId: props.sourceAccountId,
      type: new TransactionType(TransactionTypeKind.TransferOut),
      amount: props.amount,
      currencyCode: props.currencyCode,
      description: props.description,
      transferGroupId: props.transferGroupId,
      transactionDate: tDate,
    });

    // Destination entry (Inward transfer / Credit to destination account)
    const destEntry = new Transaction({
      id: props.destTransactionId,
      accountId: props.destAccountId,
      type: new TransactionType(TransactionTypeKind.TransferIn),
      amount: props.amount,
      currencyCode: props.currencyCode,
      description: props.description,
      transferGroupId: props.transferGroupId,
      transactionDate: tDate,
    });

    return { sourceEntry, destEntry };
  }
}
