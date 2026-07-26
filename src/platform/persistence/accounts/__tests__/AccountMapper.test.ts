import { describe, it, expect } from 'vitest';
import { AccountMapper } from '../AccountMapper';
import {
  Account,
  AccountId,
  AccountName,
  AccountType,
  AccountTypeKind,
  CurrencyCode,
  OpeningBalance,
} from '../../../../features/accounts/domain';
import { AccountRow } from '../../../../features/accounts/contracts';

describe('AccountMapper', () => {
  it('should map from Row to Domain entity correctly', () => {
    const nowStr = new Date().toISOString();
    const row: AccountRow = {
      id: 'acc-123',
      user_id: 'user-456',
      name: 'HDFC Savings',
      type: 'BANK',
      currency_code: 'INR',
      opening_balance: 25000.5,
      is_default: true,
      archived_at: nowStr,
      created_at: nowStr,
      updated_at: nowStr,
    };

    const entity = AccountMapper.toDomain(row);

    expect(entity.id.value).toBe('acc-123');
    expect(entity.name.value).toBe('HDFC Savings');
    expect(entity.type.kind).toBe(AccountTypeKind.Bank);
    expect(entity.currencyCode.value).toBe('INR');
    expect(entity.openingBalance.value).toBe(25000.5);
    expect(entity.isDefault).toBe(true);
    expect(entity.isArchived).toBe(true);
    expect(entity.archivedAt?.toISOString()).toBe(nowStr);
  });

  it('should map from Domain entity to Row correctly', () => {
    const now = new Date();
    const entity = new Account({
      id: new AccountId('acc-789'),
      name: new AccountName('Cash Wallet'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('USD'),
      openingBalance: new OpeningBalance(500),
      isDefault: false,
      archivedAt: null,
      createdAt: now,
    });

    const row = AccountMapper.toPersistence(entity, 'user-789');

    expect(row.id).toBe('acc-789');
    expect(row.user_id).toBe('user-789');
    expect(row.name).toBe('Cash Wallet');
    expect(row.type).toBe('CASH');
    expect(row.currency_code).toBe('USD');
    expect(row.opening_balance).toBe(500);
    expect(row.is_default).toBe(false);
    expect(row.archived_at).toBeNull();
  });

  describe('Round-trip Symmetry', () => {
    it('should maintain round-trip symmetry: Row -> Domain -> Row', () => {
      const nowStr = new Date('2026-07-25T10:00:00.000Z').toISOString();
      const originalRow: AccountRow = {
        id: 'acc-rt-1',
        user_id: 'user-rt-1',
        name: 'ICICI Bank',
        type: 'BANK',
        currency_code: 'INR',
        opening_balance: 10000,
        is_default: true,
        archived_at: null,
        created_at: nowStr,
        updated_at: nowStr,
      };

      const entity = AccountMapper.toDomain(originalRow);
      const mappedRow = AccountMapper.toPersistence(entity, 'user-rt-1');

      expect(mappedRow.id).toBe(originalRow.id);
      expect(mappedRow.user_id).toBe(originalRow.user_id);
      expect(mappedRow.name).toBe(originalRow.name);
      expect(mappedRow.type).toBe(originalRow.type);
      expect(mappedRow.currency_code).toBe(originalRow.currency_code);
      expect(mappedRow.opening_balance).toBe(originalRow.opening_balance);
      expect(mappedRow.is_default).toBe(originalRow.is_default);
      expect(mappedRow.archived_at).toBe(originalRow.archived_at);
    });

    it('should maintain round-trip symmetry: Domain -> Row -> Domain', () => {
      const now = new Date('2026-07-25T12:00:00.000Z');
      const originalEntity = new Account({
        id: new AccountId('acc-rt-2'),
        name: new AccountName('Paytm Wallet'),
        type: new AccountType(AccountTypeKind.Wallet),
        currencyCode: new CurrencyCode('INR'),
        openingBalance: new OpeningBalance(250),
        isDefault: false,
        archivedAt: now,
        createdAt: now,
      });

      const row = AccountMapper.toPersistence(originalEntity, 'user-rt-2');
      const restoredEntity = AccountMapper.toDomain(row);

      expect(restoredEntity.id.value).toBe(originalEntity.id.value);
      expect(restoredEntity.name.value).toBe(originalEntity.name.value);
      expect(restoredEntity.type.kind).toBe(originalEntity.type.kind);
      expect(restoredEntity.currencyCode.value).toBe(originalEntity.currencyCode.value);
      expect(restoredEntity.openingBalance.value).toBe(originalEntity.openingBalance.value);
      expect(restoredEntity.isDefault).toBe(originalEntity.isDefault);
      expect(restoredEntity.isArchived).toBe(true);
      expect(restoredEntity.archivedAt?.toISOString()).toBe(originalEntity.archivedAt?.toISOString());
    });
  });
});
