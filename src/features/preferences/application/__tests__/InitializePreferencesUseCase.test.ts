import { describe, it, expect, beforeEach } from 'vitest';
import { InitializePreferencesUseCase } from '../use-cases/InitializePreferencesUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';

describe('InitializePreferencesUseCase', () => {
  let repository: InMemoryPreferencesRepository;
  let useCase: InitializePreferencesUseCase;

  beforeEach(() => {
    repository = new InMemoryPreferencesRepository();
    useCase = new InitializePreferencesUseCase(repository);
  });

  it('should auto-create and persist default preferences if none exist for user', async () => {
    const result = await useCase.execute('user-123');

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.userId).toBe('user-123');
    expect(result.data.finance.currencyCode.value).toBe('INR');

    const check = await repository.get('user-123');
    expect(check.success).toBe(true);
    if (check.success) {
      expect(check.data?.userId).toBe('user-123');
    }
  });

  it('should return existing preferences if already present', async () => {
    await useCase.execute('user-123');
    const secondResult = await useCase.execute('user-123');

    expect(secondResult.success).toBe(true);
    if (secondResult.success) {
      expect(secondResult.data.userId).toBe('user-123');
    }
  });
});
