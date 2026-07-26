import { describe, it, expect } from 'vitest';
import { AccountType, AccountTypeKind } from '../value-objects/AccountType';

describe('AccountType Value Object', () => {
  it('should correctly identify asset accounts (Cash, Bank, Wallet)', () => {
    const cash = new AccountType(AccountTypeKind.Cash);
    const bank = new AccountType(AccountTypeKind.Bank);
    const wallet = new AccountType(AccountTypeKind.Wallet);
    const credit = new AccountType(AccountTypeKind.CreditCard);

    expect(cash.isAsset()).toBe(true);
    expect(bank.isAsset()).toBe(true);
    expect(wallet.isAsset()).toBe(true);
    expect(credit.isAsset()).toBe(false);
  });

  it('should correctly identify credit accounts (CreditCard)', () => {
    const credit = new AccountType(AccountTypeKind.CreditCard);
    const cash = new AccountType(AccountTypeKind.Cash);

    expect(credit.isCredit()).toBe(true);
    expect(cash.isCredit()).toBe(false);
  });

  it('should correctly identify accounts that can have negative balances', () => {
    const credit = new AccountType(AccountTypeKind.CreditCard);
    const bank = new AccountType(AccountTypeKind.Bank);
    const cash = new AccountType(AccountTypeKind.Cash);

    expect(credit.canHaveNegativeBalance()).toBe(true);
    expect(bank.canHaveNegativeBalance()).toBe(true);
    expect(cash.canHaveNegativeBalance()).toBe(false);
  });
});
