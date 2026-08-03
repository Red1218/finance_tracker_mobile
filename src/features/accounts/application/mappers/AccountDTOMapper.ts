import { Account } from '../../domain';
import { AccountDTO } from '../dto/AccountDTO';

export class AccountDTOMapper {
  public static toDTO(account: Account): AccountDTO {
    return Object.freeze({
      id: account.id.value,
      name: account.name.value,
      type: account.type.kind,
      currencyCode: account.currencyCode.value,
      openingBalance: account.openingBalance.value,
      isDefault: account.isDefault,
      isArchived: account.isArchived,
      archivedAt: account.archivedAt ? account.archivedAt.toISOString() : null,
      createdAt: account.createdAt.toISOString(),
    });
  }
}
