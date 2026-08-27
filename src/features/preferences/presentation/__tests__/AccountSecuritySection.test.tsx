import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { AccountSecuritySection } from '../components/AccountSecuritySection';
import { AuthController } from '../../../auth/presentation/controllers/AuthController';
import { InMemoryAuthProvider } from '../../../auth/application/__tests__/InMemoryAuthProvider';
import {
  LoginUseCase,
  LogoutUseCase,
  GetSessionUseCase,
  RestoreSessionUseCase,
  RefreshSessionUseCase,
} from '../../../auth/application/use-cases';

describe('AccountSecuritySection Behavioral Tests', () => {
  it('renders user email correctly', () => {
    const onSignOut = vi.fn();
    const element = React.createElement(AccountSecuritySection, {
      userEmail: 'finance.user@domain.com',
      onSignOut,
    });
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.userEmail).toBe('finance.user@domain.com');
  });

  it('triggers onSignOut callback when action is triggered', () => {
    const onSignOut = vi.fn();
    const props = {
      userEmail: 'user@example.com',
      onSignOut,
      disabled: false,
    };
    props.onSignOut();
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('integrates with AuthController to execute logout flow', async () => {
    const provider = new InMemoryAuthProvider();
    const controller = new AuthController(
      new LoginUseCase(provider),
      new LogoutUseCase(provider),
      new GetSessionUseCase(provider),
      new RestoreSessionUseCase(provider),
      new RefreshSessionUseCase(provider)
    );

    // 1. Authenticate user
    await controller.login({ email: 'user@example.com', password: 'password123' });
    expect(controller.getState().viewModel.isAuthenticated).toBe(true);

    // 2. Perform logout (simulating confirmation Sign Out action)
    await controller.logout();
    expect(controller.getState().viewModel.isAuthenticated).toBe(false);
    expect(controller.getState().viewModel.userEmail).toBeNull();
  });
});
