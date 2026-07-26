import { describe, it, expect, beforeEach } from 'vitest';
import { LoadAccountsUseCase } from '../use-cases/LoadAccountsUseCase';
import { LoadAccountUseCase } from '../use-cases/LoadAccountUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { ArchiveAccountUseCase } from '../use-cases/ArchiveAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind } from '../../domain';

describe('LoadAccounts Use Cases', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let archiveUseCase: ArchiveAccountUseCase;
  let loadAccountsUseCase: LoadAccountsUseCase;
  let loadAccountUseCase: LoadAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    archiveUseCase = new ArchiveAccountUseCase(repository);
    loadAccountsUseCase = new LoadAccountsUseCase(repository);
    loadAccountUseCase = new LoadAccountUseCase(repository);
  });

  it('should return empty list when repository is empty', async () => {
    const res = await loadAccountsUseCase.execute();
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.length).toBe(0);
    }
  });

  it('should filter out archived accounts unless includeArchived is true', async () => {
    const res1 = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    const res2 = await createUseCase.execute({ id: 'acc-2', name: 'Bank', type: AccountTypeKind.Bank });
    if (!res1.success || !res2.success) throw new Error('Create failed');
    const acc1 = res1.data;
    const acc2 = res2.data;

    await archiveUseCase.execute({ accountId: acc2.id.value });

    const activeOnlyRes = await loadAccountsUseCase.execute({ includeArchived: false });
    expect(activeOnlyRes.success).toBe(true);
    if (activeOnlyRes.success) {
      expect(activeOnlyRes.data.length).toBe(1);
      expect(activeOnlyRes.data[0].id.value).toBe('acc-1');
    }

    const allRes = await loadAccountsUseCase.execute({ includeArchived: true });
    expect(allRes.success).toBe(true);
    if (allRes.success) {
      expect(allRes.data.length).toBe(2);
    }
  });

  it('should return null when loading a non-existent account ID', async () => {
    const res = await loadAccountUseCase.execute({ accountId: 'non-existent' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toBeNull();
    }
  });
});
