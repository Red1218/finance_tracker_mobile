import { describe, it, expect, beforeEach } from 'vitest';
import { ArchiveAccountUseCase } from '../use-cases/ArchiveAccountUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind, AccountDomainError } from '../../domain';

describe('ArchiveAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let archiveUseCase: ArchiveAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    archiveUseCase = new ArchiveAccountUseCase(repository);
  });

  it('should reject archiving when only one active account exists', async () => {
    const createRes = await createUseCase.execute({ name: 'Cash', type: AccountTypeKind.Cash });
    if (!createRes.success) throw createRes.error;
    const acc = createRes.data;

    const result = await archiveUseCase.execute({ accountId: acc.id.value });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AccountDomainError);
      expect((result.error as AccountDomainError).code).toBe('LAST_ACTIVE_ACCOUNT_ARCHIVE');
    }
  });

  it('should automatically promote the oldest remaining active account to default when archiving current default account', async () => {
    const res1 = await createUseCase.execute({ id: 'acc-1', name: 'Cash Wallet', type: AccountTypeKind.Cash, isDefault: true });
    const res2 = await createUseCase.execute({ id: 'acc-2', name: 'HDFC Bank', type: AccountTypeKind.Bank });
    if (!res1.success) throw res1.error;
    if (!res2.success) throw res2.error;
    const acc1 = res1.data;
    const acc2 = res2.data;

    // acc1 is default
    expect(acc1.isDefault).toBe(true);

    const archiveResult = await archiveUseCase.execute({ accountId: acc1.id.value });
    expect(archiveResult.success).toBe(true);

    const get1 = await repository.getById(acc1.id);
    const get2 = await repository.getById(acc2.id);
    if (!get1.success || !get1.data) throw new Error('Account 1 not found');
    if (!get2.success || !get2.data) throw new Error('Account 2 not found');
    const checkAcc1 = get1.data;
    const checkAcc2 = get2.data;

    expect(checkAcc1.isArchived).toBe(true);
    expect(checkAcc1.isDefault).toBe(false);

    // acc2 was automatically promoted to default!
    expect(checkAcc2.isDefault).toBe(true);
  });
});
