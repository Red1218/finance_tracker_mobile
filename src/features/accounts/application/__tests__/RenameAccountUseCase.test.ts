import { describe, it, expect, beforeEach } from 'vitest';
import { RenameAccountUseCase } from '../use-cases/RenameAccountUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind, AccountDomainError } from '../../domain';

describe('RenameAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let renameUseCase: RenameAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    renameUseCase = new RenameAccountUseCase(repository);
  });

  it('should successfully rename an existing account', async () => {
    const res = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    if (!res.success) throw res.error;

    const renameRes = await renameUseCase.execute({ accountId: 'acc-1', newName: 'Primary Cash' });
    expect(renameRes.success).toBe(true);

    if (renameRes.success) {
      expect(renameRes.data.name.value).toBe('Primary Cash');
    }
  });

  it('should allow renaming an account to its current name (idempotent behavior)', async () => {
    const res = await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    if (!res.success) throw res.error;

    const renameRes = await renameUseCase.execute({ accountId: 'acc-1', newName: 'Cash' });
    expect(renameRes.success).toBe(true);
  });

  it('should reject renaming to another existing active account name', async () => {
    await createUseCase.execute({ id: 'acc-1', name: 'Cash', type: AccountTypeKind.Cash });
    await createUseCase.execute({ id: 'acc-2', name: 'Bank', type: AccountTypeKind.Bank });

    const renameRes = await renameUseCase.execute({ accountId: 'acc-2', newName: 'Cash' });
    expect(renameRes.success).toBe(false);
    if (!renameRes.success) {
      expect(renameRes.error).toBeInstanceOf(AccountDomainError);
      expect((renameRes.error as AccountDomainError).code).toBe('DUPLICATE_ACCOUNT_NAME');
    }
  });
});
