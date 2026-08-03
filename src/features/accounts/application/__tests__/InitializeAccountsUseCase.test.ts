import { describe, it, expect, beforeEach } from 'vitest';
import { InitializeAccountsUseCase } from '../commands/InitializeAccountsUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';

describe('InitializeAccountsUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: InitializeAccountsUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    useCase = new InitializeAccountsUseCase(repository);
  });

  it('should auto-create default Cash account if repository has zero accounts', async () => {
    const result = await useCase.execute();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cash Wallet');
    expect(result[0].isDefault).toBe(true);
  });

  it('should return existing active accounts without creating duplicate default if accounts already exist', async () => {
    await useCase.execute();
    const secondResult = await useCase.execute();

    expect(Array.isArray(secondResult)).toBe(true);
    expect(secondResult.length).toBe(1);
  });
});
