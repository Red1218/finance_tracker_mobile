import {
  Account,
  AccountId,
  AccountName,
  AccountType,
  AccountTypeKind,
  CurrencyCode,
  OpeningBalance,
} from '../../../features/accounts/domain';
import { AccountRow } from '../../../features/accounts/contracts';

export class AccountMapper {
  public static toDomain(row: AccountRow): Account {
    const accountId = new AccountId(row.id);
    const name = new AccountName(row.name);
    const type = new AccountType(row.type as AccountTypeKind);
    const currencyCode = new CurrencyCode(row.currency_code);
    const openingBalance = new OpeningBalance(Number(row.opening_balance));
    const archivedAt = row.archived_at ? new Date(row.archived_at) : null;
    const createdAt = row.created_at ? new Date(row.created_at) : new Date();

    return new Account({
      id: accountId,
      name,
      type,
      currencyCode,
      openingBalance,
      isDefault: row.is_default,
      archivedAt,
      createdAt,
    });
  }

  public static toPersistence(entity: Account, userId?: string | null): AccountRow {
    return {
      id: entity.id.value,
      user_id: userId ?? null,
      name: entity.name.value,
      type: entity.type.kind,
      currency_code: entity.currencyCode.value,
      opening_balance: entity.openingBalance.value,
      is_default: entity.isDefault,
      archived_at: entity.archivedAt ? entity.archivedAt.toISOString() : null,
      created_at: entity.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
