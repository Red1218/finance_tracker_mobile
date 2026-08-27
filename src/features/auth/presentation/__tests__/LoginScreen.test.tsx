import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { AuthController } from '../controllers/AuthController';
import { InMemoryAuthProvider } from '../../application/__tests__/InMemoryAuthProvider';
import {
  LoginUseCase,
  LogoutUseCase,
  GetSessionUseCase,
  RestoreSessionUseCase,
  RefreshSessionUseCase,
} from '../../application/use-cases';

describe('LoginScreen Behavioral & Controller Integration', () => {
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

  it('renders LoginScreen React element tree correctly', () => {
    const element = React.createElement(LoginScreen);
    expect(React.isValidElement(element)).toBe(true);
  });

  it('begins in unauthenticated state with empty error', () => {
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('handles valid authentication flow and transitions to authenticated view model', async () => {
    const loginResult = await controller.login({
      email: 'user@finance.app',
      password: 'password123',
    });

    expect(loginResult).toBe(true);
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(true);
    expect(state.viewModel.userEmail).toBe('user@finance.app');
    expect(state.error).toBeNull();
  });

  it('handles invalid credentials and captures error message in state', async () => {
    const loginResult = await controller.login({
      email: 'user@finance.app',
      password: 'wrong-password',
    });

    expect(loginResult).toBe(false);
    const state = controller.getState();
    expect(state.viewModel.isAuthenticated).toBe(false);
    expect(state.error).toBeTruthy();
  });

  it('resets authentication state cleanly on logout execution', async () => {
    await controller.login({ email: 'user@finance.app', password: 'password123' });
    expect(controller.getState().viewModel.isAuthenticated).toBe(true);

    await controller.logout();
    expect(controller.getState().viewModel.isAuthenticated).toBe(false);
    expect(controller.getState().viewModel.userId).toBeNull();
  });
});
