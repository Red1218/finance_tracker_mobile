import { describe, it, expect, beforeEach } from 'vitest';
import { InitializeAccountsUseCase } from '../use-cases/InitializeAccountsUseCase';
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

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].name.value).toBe('Cash Wallet');
      expect(result.data[0].isDefault).toBe(true);
    }
  });

  it('should return existing active accounts without creating duplicate default if accounts already exist', async () => {
    await useCase.execute();
    const secondResult = await useCase.execute();

    expect(secondResult.success).toBe(true);
    if (secondResult.success) {
      expect(secondResult.data.length).toBe(1);
    }
  });
});
