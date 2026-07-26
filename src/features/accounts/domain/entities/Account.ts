import { AccountId } from '../value-objects/AccountId';
import { AccountName } from '../value-objects/AccountName';
import { AccountType, AccountTypeKind } from '../value-objects/AccountType';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { OpeningBalance } from '../value-objects/OpeningBalance';
import { AccountDomainError } from '../errors/AccountDomainError';

export interface AccountProps {
  id: AccountId;
  name: AccountName;
  type: AccountType;
  currencyCode: CurrencyCode;
  openingBalance: OpeningBalance;
  isDefault: boolean;
  archivedAt?: Date | null;
  createdAt?: Date;
}

export class Account {
  public readonly id: AccountId;
  public readonly name: AccountName;
  public readonly type: AccountType;
  public readonly currencyCode: CurrencyCode;
  public readonly openingBalance: OpeningBalance;
  public readonly isDefault: boolean;
  public readonly archivedAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.currencyCode = props.currencyCode;
    this.openingBalance = props.openingBalance;
    this.isDefault = props.isDefault;
    this.archivedAt = props.archivedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();

    Object.freeze(this);
  }

  public get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  public static createDefault(id?: AccountId): Account {
    return new Account({
      id: id ?? new AccountId('default-cash-account'),
      name: new AccountName('Cash Wallet'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(0),
      isDefault: true,
      archivedAt: null,
    });
  }

  public rename(newName: AccountName): Account {
    if (this.isArchived) {
      throw new AccountDomainError(
        'ARCHIVED_ACCOUNT_MODIFICATION',
        `Cannot rename archived account "${this.name.value}".`
      );
    }

    return new Account({
      id: this.id,
      name: newName,
      type: this.type,
      currencyCode: this.currencyCode,
      openingBalance: this.openingBalance,
      isDefault: this.isDefault,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
    });
  }

  public archive(archivedAt: Date = new Date()): Account {
    if (this.isArchived) {
      throw new AccountDomainError(
        'ARCHIVED_ACCOUNT_MODIFICATION',
        `Account "${this.name.value}" is already archived.`
      );
    }

    return new Account({
      id: this.id,
      name: this.name,
      type: this.type,
      currencyCode: this.currencyCode,
      openingBalance: this.openingBalance,
      isDefault: false, // Archiving clears default flag on this instance
      archivedAt,
      createdAt: this.createdAt,
    });
  }

  public restore(): Account {
    if (!this.isArchived) {
      throw new AccountDomainError(
        'ARCHIVED_ACCOUNT_MODIFICATION',
        `Account "${this.name.value}" is not archived.`
      );
    }

    return new Account({
      id: this.id,
      name: this.name,
      type: this.type,
      currencyCode: this.currencyCode,
      openingBalance: this.openingBalance,
      isDefault: this.isDefault,
      archivedAt: null,
      createdAt: this.createdAt,
    });
  }

  public setDefault(isDefault: boolean): Account {
    if (this.isArchived && isDefault) {
      throw new AccountDomainError(
        'ARCHIVED_ACCOUNT_MODIFICATION',
        `Cannot set archived account "${this.name.value}" as default.`
      );
    }

    return new Account({
      id: this.id,
      name: this.name,
      type: this.type,
      currencyCode: this.currencyCode,
      openingBalance: this.openingBalance,
      isDefault,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
    });
  }
}
