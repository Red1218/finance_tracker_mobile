import { describe, expect, it } from 'vitest';
import { AuthModule } from '../../features/auth/composition/AuthModule';
import { InMemoryAuthProvider } from '../../features/auth/application/__tests__/InMemoryAuthProvider';
import { EmailAddress, UserId, UserSession } from '../../features/auth/domain';
import { restoreAuthSession } from '../AuthSessionProvider';

describe('AuthSessionProvider', () => {
  it('hydrates the auth controller from a persisted session before guards evaluate it', async () => {
    const provider = new InMemoryAuthProvider();
    provider.seedSession(
      UserSession.createAuthenticated({
        userId: new UserId('user-uuid-123'),
        email: new EmailAddress('user@example.com'),
        expiresAt: new Date(Date.now() + 60_000),
      })
    );
    const authModule = new AuthModule(provider);

    await restoreAuthSession(authModule);

    expect(authModule.authController.getState().viewModel).toMatchObject({
      isAuthenticated: true,
      userId: 'user-uuid-123',
      userEmail: 'user@example.com',
    });
  });
});
