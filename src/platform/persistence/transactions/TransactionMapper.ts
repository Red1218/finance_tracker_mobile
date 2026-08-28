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
    const rawDate = row.occurred_at || new Date().toISOString();
    const rawVoided = row.archived_at || null;
    return new Transaction({
      id: new TransactionId(row.id),
      accountId: new AccountId(row.account_id),
      categoryId: row.category_id,
      type: new TransactionType(row.type as TransactionTypeKind),
      amount: new Money(Number(row.amount)),
      currencyCode: new CurrencyCode(row.currency_code),
      description: row.description ? new TransactionDescription(row.description) : new TransactionDescription(''),
      transferGroupId: row.transfer_group_id ? new TransferReference(row.transfer_group_id) : null,
      transactionDate: new TransactionDate(new Date(rawDate)),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      voidedAt: rawVoided ? new Date(rawVoided) : null,
    });
  }

  public static toPersistence(entity: Transaction, userId: string): TransactionRow {
    const isoDate = entity.transactionDate.value.toISOString();
    const isoVoided = entity.voidedAt ? entity.voidedAt.toISOString() : null;
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
      occurred_at: isoDate,
      created_at: entity.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: isoVoided,
    };
  }

}
