import { describe, it, expect, beforeEach } from 'vitest';
import { RefreshSessionUseCase } from '../use-cases/RefreshSessionUseCase';
import { InMemoryAuthProvider } from './InMemoryAuthProvider';
import { UserSession, UserId, EmailAddress, AuthDomainError } from '../../domain';

describe('RefreshSessionUseCase', () => {
  let provider: InMemoryAuthProvider;
  let useCase: RefreshSessionUseCase;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    useCase = new RefreshSessionUseCase(provider);
  });

  it('refreshes active session extending expiration', async () => {
    provider.seedSession(
      UserSession.createAuthenticated({
        userId: new UserId('usr-1'),
        email: new EmailAddress('user@example.com'),
        expiresAt: new Date(Date.now() + 1000 * 3600),
      })
    );

    const dto = await useCase.execute();
    expect(dto.isAuthenticated).toBe(true);
    expect(dto.expiresAt).toBeDefined();
  });

  it('fails refresh if session is unauthenticated', async () => {
    await expect(useCase.execute()).rejects.toThrow(AuthDomainError);
  });
});
