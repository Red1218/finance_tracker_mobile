import { describe, it, expect, beforeEach } from 'vitest';
import { GetSessionUseCase } from '../use-cases/GetSessionUseCase';
import { InMemoryAuthProvider } from './InMemoryAuthProvider';
import { UserSession, UserId, EmailAddress } from '../../domain';

describe('GetSessionUseCase', () => {
  let provider: InMemoryAuthProvider;
  let useCase: GetSessionUseCase;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    useCase = new GetSessionUseCase(provider);
  });

  it('returns current session DTO', async () => {
    provider.seedSession(
      UserSession.createAuthenticated({
        userId: new UserId('usr-99'),
        email: new EmailAddress('active@example.com'),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      })
    );

    const dto = await useCase.execute();
    expect(dto.userId).toBe('usr-99');
    expect(dto.email).toBe('active@example.com');
    expect(dto.isAuthenticated).toBe(true);
  });
});
