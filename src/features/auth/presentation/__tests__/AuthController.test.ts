import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from '../controllers/AuthController';
import { InMemoryAuthProvider } from '../../application/__tests__/InMemoryAuthProvider';
import { 
  LoginUseCase, 
  LogoutUseCase, 
  GetSessionUseCase, 
  RestoreSessionUseCase, 
  RefreshSessionUseCase 
} from '../../application/use-cases';

describe('AuthController', () => {
  let provider: InMemoryAuthProvider;
  let controller: AuthController;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    controller = new AuthController(
      new LoginUseCase(provider),
      new LogoutUseCase(provider),
      new GetSessionUseCase(provider),
      new RestoreSessionUseCase(provider),
      new RefreshSessionUseCase(provider)
    );
  });

  it('initializes with unauthenticated state', () => {
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(false);
    expect(state.viewModel.status).toBe('UNAUTHENTICATED');
    expect(state.isLoading).toBe(false);
  });

  it('updates state on successful login', async () => {
    const success = await controller.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(success).toBe(true);
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(true);
    expect(state.viewModel.userEmail).toBe('user@example.com');
  });

  it('captures error state on login failure', async () => {
    const success = await controller.login({
      email: 'user@example.com',
      password: 'wrong-password',
    });

    expect(success).toBe(false);
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(false);
    expect(state.error).toBeDefined();
  });

  it('updates state on logout', async () => {
    await controller.login({ email: 'user@example.com', password: 'password123' });
    await controller.logout();

    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(false);
  });
});
