import { describe, it, expect, beforeEach } from 'vitest';
import { LoadAccountsQueryUseCase } from '../queries/LoadAccountsQueryUseCase';
import { LoadAccountByIdQueryUseCase } from '../queries/LoadAccountByIdQueryUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { AccountNotFoundError } from '../errors/AccountApplicationError';

describe('LoadAccounts Queries', () => {
  let repository: InMemoryAccountRepository;
  let loadAccountsQuery: LoadAccountsQueryUseCase;
  let loadAccountByIdQuery: LoadAccountByIdQueryUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();

    const acc1 = new Account({
      id: new AccountId('acc-1'),
      name: new AccountName('Active Acc'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(100),
      isDefault: true,
    });

    const acc2 = new Account({
      id: new AccountId('acc-2'),
      name: new AccountName('Archived Acc'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(50),
      isDefault: false,
      archivedAt: new Date(),
    });

    repository.seed(acc1);
    repository.seed(acc2);

    loadAccountsQuery = new LoadAccountsQueryUseCase(repository);
    loadAccountByIdQuery = new LoadAccountByIdQueryUseCase(repository);
  });

  it('should load active accounts only by default', async () => {
    const list = await loadAccountsQuery.execute(false);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('acc-1');
  });

  it('should load single account by ID returning DTO', async () => {
    const dto = await loadAccountByIdQuery.execute('acc-1');
    expect(dto.id).toBe('acc-1');
    expect(dto.name).toBe('Active Acc');
  });

  it('should throw AccountNotFoundError when account ID is invalid', async () => {
    await expect(loadAccountByIdQuery.execute('missing')).rejects.toThrow(AccountNotFoundError);
  });
});
