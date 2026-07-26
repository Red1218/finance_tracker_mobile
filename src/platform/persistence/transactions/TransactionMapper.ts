import {
  Transaction,
  TransactionId,
  Money,
  TransactionType,
  TransactionTypeKind,
  TransactionDate,
  TransactionDescription,
  TransferReference,
} from '../../../features/transactions/domain';
import { AccountId, CurrencyCode } from '../../../features/accounts/domain';
import { TransactionRow } from '../../../features/transactions/contracts/TransactionRow';

export class TransactionMapper {
  public static toDomain(row: TransactionRow): Transaction {
    return new Transaction({
      id: new TransactionId(row.id),
      accountId: new AccountId(row.account_id),
      categoryId: row.category_id,
      type: new TransactionType(row.type as TransactionTypeKind),
      amount: new Money(Number(row.amount)),
      currencyCode: new CurrencyCode(row.currency_code),
      description: row.description ? new TransactionDescription(row.description) : new TransactionDescription(''),
      transferGroupId: row.transfer_group_id ? new TransferReference(row.transfer_group_id) : null,
      transactionDate: new TransactionDate(new Date(row.transaction_date)),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      voidedAt: row.voided_at ? new Date(row.voided_at) : null,
    });
  }

  public static toPersistence(entity: Transaction, userId: string): TransactionRow {
    return {
      id: entity.id.value,
      user_id: userId,
      account_id: entity.accountId.value,
      category_id: entity.categoryId ?? null,
      type: entity.type.kind,
      amount: entity.amount.value,
      currency_code: entity.currencyCode.value,
      description: entity.description ? entity.description.value : null,
      transfer_group_id: entity.transferGroupId ? entity.transferGroupId.value : null,
      transaction_date: entity.transactionDate.value.toISOString(),
      created_at: entity.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      voided_at: entity.voidedAt ? entity.voidedAt.toISOString() : null,
    };
  }
}
