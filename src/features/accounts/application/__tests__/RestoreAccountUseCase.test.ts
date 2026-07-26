import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreAccountUseCase } from '../use-cases/RestoreAccountUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { ArchiveAccountUseCase } from '../use-cases/ArchiveAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind } from '../../domain';

describe('RestoreAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let archiveUseCase: ArchiveAccountUseCase;
  let restoreUseCase: RestoreAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    archiveUseCase = new ArchiveAccountUseCase(repository);
    restoreUseCase = new RestoreAccountUseCase(repository);
  });

  it('should restore an archived account', async () => {
    const res1 = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    const res2 = await createUseCase.execute({ id: 'acc-2', name: 'Bank', type: AccountTypeKind.Bank });
    if (!res1.success || !res2.success) throw new Error('Create failed');
    const acc2 = res2.data;

    await archiveUseCase.execute({ accountId: acc2.id.value });
    const checkArchived = await repository.getById(acc2.id);
    if (!checkArchived.success || !checkArchived.data) throw new Error('Account not found');
    expect(checkArchived.data.isArchived).toBe(true);

    const restoreRes = await restoreUseCase.execute({ accountId: acc2.id.value });
    expect(restoreRes.success).toBe(true);

    const checkRestored = await repository.getById(acc2.id);
    if (!checkRestored.success || !checkRestored.data) throw new Error('Account not found');
    expect(checkRestored.data.isArchived).toBe(false);
  });
});
