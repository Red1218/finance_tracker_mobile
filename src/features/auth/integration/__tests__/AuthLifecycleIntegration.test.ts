import { describe, it, expect, beforeEach } from 'vitest';
import { AuthModule } from '../../composition/AuthModule';
import { InMemoryAuthProvider } from '../../application/__tests__/InMemoryAuthProvider';
import { AuthStatus } from '../../domain';

describe('Authentication Bounded Context — End-to-End Lifecycle Integration', () => {
  let provider: InMemoryAuthProvider;
  let authModule: AuthModule;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    authModule = new AuthModule(provider);
  });

  it('executes complete authentication lifecycle: unauthenticated -> login -> restore -> refresh -> logout', async () => {
    // 1. Initial State: Unauthenticated
    const initialViewModel = authModule.authController.getState().viewModel;
    expect(initialViewModel.isAuthenticated).toBe(false);
    expect(initialViewModel.status).toBe(AuthStatus.UNAUTHENTICATED);

    // 2. Perform Login
    const loginSuccess = await authModule.authController.login({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(loginSuccess).toBe(true);

    const loggedInViewModel = authModule.authController.getState().viewModel;
    expect(loggedInViewModel.isAuthenticated).toBe(true);
    expect(loggedInViewModel.status).toBe(AuthStatus.AUTHENTICATED);
    expect(loggedInViewModel.userEmail).toBe('user@example.com');
    expect(loggedInViewModel.userId).toBe('user-uuid-123');

    // 3. Perform Session Restore (e.g. app restart)
    await authModule.authController.restoreSession();
    const restoredViewModel = authModule.authController.getState().viewModel;
    expect(restoredViewModel.isAuthenticated).toBe(true);
    expect(restoredViewModel.userEmail).toBe('user@example.com');

    // 4. Perform Session Refresh
    const refreshSuccess = await authModule.authController.refreshSession();
    expect(refreshSuccess).toBe(true);
    const refreshedViewModel = authModule.authController.getState().viewModel;
    expect(refreshedViewModel.isAuthenticated).toBe(true);

    // 5. Perform Logout
    await authModule.authController.logout();
    const loggedOutViewModel = authModule.authController.getState().viewModel;
    expect(loggedOutViewModel.isAuthenticated).toBe(false);
    expect(loggedOutViewModel.status).toBe(AuthStatus.UNAUTHENTICATED);
    expect(loggedOutViewModel.userId).toBeNull();
    expect(loggedOutViewModel.userEmail).toBeNull();
  });
});
