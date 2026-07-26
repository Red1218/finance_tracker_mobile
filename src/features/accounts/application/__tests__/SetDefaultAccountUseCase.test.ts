import { describe, it, expect, beforeEach } from 'vitest';
import { SetDefaultAccountUseCase } from '../use-cases/SetDefaultAccountUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { ArchiveAccountUseCase } from '../use-cases/ArchiveAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind, AccountDomainError } from '../../domain';

describe('SetDefaultAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let archiveUseCase: ArchiveAccountUseCase;
  let setDefaultUseCase: SetDefaultAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    archiveUseCase = new ArchiveAccountUseCase(repository);
    setDefaultUseCase = new SetDefaultAccountUseCase(repository);
  });

  it('should atomically switch default account between active accounts', async () => {
    const res1 = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    const res2 = await createUseCase.execute({ id: 'acc-2', name: 'Bank', type: AccountTypeKind.Bank });
    if (!res1.success) throw res1.error;
    if (!res2.success) throw res2.error;
    const acc1 = res1.data;
    const acc2 = res2.data;

    const result = await setDefaultUseCase.execute({ accountId: acc2.id.value });

    expect(result.success).toBe(true);

    const get1 = await repository.getById(acc1.id);
    const get2 = await repository.getById(acc2.id);
    if (!get1.success || !get1.data) throw new Error('Account 1 not found');
    if (!get2.success || !get2.data) throw new Error('Account 2 not found');
    const checkAcc1 = get1.data;
    const checkAcc2 = get2.data;

    expect(checkAcc1.isDefault).toBe(false);
    expect(checkAcc2.isDefault).toBe(true);
  });

  it('should reject setting an archived account as default', async () => {
    const res1 = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    const res2 = await createUseCase.execute({ id: 'acc-2', name: 'Bank', type: AccountTypeKind.Bank });
    if (!res1.success) throw res1.error;
    if (!res2.success) throw res2.error;
    const acc1 = res1.data;
    const acc2 = res2.data;

    await archiveUseCase.execute({ accountId: acc2.id.value });

    const result = await setDefaultUseCase.execute({ accountId: acc2.id.value });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AccountDomainError);
      expect((result.error as AccountDomainError).code).toBe('ARCHIVED_ACCOUNT_MODIFICATION');
    }
  });
});
