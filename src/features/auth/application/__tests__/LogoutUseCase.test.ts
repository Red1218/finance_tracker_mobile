import { describe, it, expect, beforeEach } from 'vitest';
import { LogoutUseCase } from '../use-cases/LogoutUseCase';
import { GetSessionUseCase } from '../use-cases/GetSessionUseCase';
import { InMemoryAuthProvider } from './InMemoryAuthProvider';
import { UserSession, UserId, EmailAddress } from '../../domain';

describe('LogoutUseCase', () => {
  let provider: InMemoryAuthProvider;
  let logoutUseCase: LogoutUseCase;
  let getSessionUseCase: GetSessionUseCase;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    logoutUseCase = new LogoutUseCase(provider);
    getSessionUseCase = new GetSessionUseCase(provider);

    provider.seedSession(
      UserSession.createAuthenticated({
        userId: new UserId('usr-1'),
        email: new EmailAddress('user@example.com'),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      })
    );
  });

  it('invalidates current session on logout', async () => {
    await logoutUseCase.execute();
    const sessionDto = await getSessionUseCase.execute();

    expect(sessionDto.isAuthenticated).toBe(false);
    expect(sessionDto.status).toBe('UNAUTHENTICATED');
  });
});
