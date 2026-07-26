import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreSessionUseCase } from '../use-cases/RestoreSessionUseCase';
import { InMemoryAuthProvider } from './InMemoryAuthProvider';

describe('RestoreSessionUseCase', () => {
  let provider: InMemoryAuthProvider;
  let useCase: RestoreSessionUseCase;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    useCase = new RestoreSessionUseCase(provider);
  });

  it('restores session from provider', async () => {
    const dto = await useCase.execute();
    expect(dto).toBeDefined();
    expect(dto.isAuthenticated).toBe(false);
  });
});
