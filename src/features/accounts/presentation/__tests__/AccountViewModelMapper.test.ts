import { describe, it, expect } from 'vitest';
import { AccountViewModelMapper } from '../mappers/AccountViewModelMapper';
import {
  Account,
  AccountId,
  AccountName,
  AccountType,
  AccountTypeKind,
  CurrencyCode,
  OpeningBalance,
} from '../../domain';

describe('AccountViewModelMapper', () => {
  it('should map Account entity to AccountViewModel correctly with INR currency formatting', () => {
    const account = new Account({
      id: new AccountId('acc-101'),
      name: new AccountName('HDFC Savings Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(50000),
      isDefault: true,
      archivedAt: null,
    });

    const vm = AccountViewModelMapper.mapToViewModel(account);

    expect(vm.id).toBe('acc-101');
    expect(vm.name).toBe('HDFC Savings Account');
    expect(vm.type).toBe(AccountTypeKind.Bank);
    expect(vm.typeLabel).toBe('Bank Account');
    expect(vm.currencyCode).toBe('INR');
    expect(vm.openingBalance).toBe(50000);
    expect(vm.formattedOpeningBalance).toContain('₹');
    expect(vm.formattedOpeningBalance).toContain('50,000');
    expect(vm.isDefault).toBe(true);
    expect(vm.isArchived).toBe(false);
    expect(vm.archivedAt).toBeNull();
  });
});
