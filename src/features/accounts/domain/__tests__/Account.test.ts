import { describe, it, expect } from 'vitest';
import { Account } from '../entities/Account';
import { AccountId } from '../value-objects/AccountId';
import { AccountName } from '../value-objects/AccountName';
import { AccountType, AccountTypeKind } from '../value-objects/AccountType';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { OpeningBalance } from '../value-objects/OpeningBalance';
import { AccountDomainError } from '../errors/AccountDomainError';

describe('Account Aggregate', () => {
  it('should create default Cash account with Account.createDefault()', () => {
    const account = Account.createDefault();

    expect(account.id.value).toBe('default-cash-account');
    expect(account.name.value).toBe('Cash Wallet');
    expect(account.type.kind).toBe(AccountTypeKind.Cash);
    expect(account.type.isAsset()).toBe(true);
    expect(account.currencyCode.value).toBe('INR');
    expect(account.openingBalance.value).toBe(0);
    expect(account.isDefault).toBe(true);
    expect(account.archivedAt).toBeNull();
    expect(account.isArchived).toBe(false);
  });

  it('should immutably rename active account', () => {
    const original = Account.createDefault();
    const newName = new AccountName('Primary Cash');

    const renamed = original.rename(newName);

    expect(renamed).not.toBe(original);
    expect(renamed.name.value).toBe('Primary Cash');
    expect(original.name.value).toBe('Cash Wallet');
  });

  it('should throw AccountDomainError when trying to rename an archived account', () => {
    const account = Account.createDefault().archive();

    expect(() => account.rename(new AccountName('New Name'))).toThrowError(AccountDomainError);
  });

  it('should derive isArchived boolean strictly from archivedAt timestamp', () => {
    const activeAccount = Account.createDefault();
    expect(activeAccount.archivedAt).toBeNull();
    expect(activeAccount.isArchived).toBe(false);

    const now = new Date();
    const archivedAccount = activeAccount.archive(now);
    expect(archivedAccount.archivedAt).toEqual(now);
    expect(archivedAccount.isArchived).toBe(true);

    const restoredAccount = archivedAccount.restore();
    expect(restoredAccount.archivedAt).toBeNull();
    expect(restoredAccount.isArchived).toBe(false);
  });

  it('should throw error when setting an archived account as default', () => {
    const archivedAccount = Account.createDefault().archive();

    expect(() => archivedAccount.setDefault(true)).toThrowError(AccountDomainError);
  });
});
