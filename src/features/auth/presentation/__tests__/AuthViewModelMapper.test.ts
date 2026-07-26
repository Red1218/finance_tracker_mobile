import { describe, it, expect } from 'vitest';
import { AuthViewModelMapper } from '../mappers/AuthViewModelMapper';
import { AuthSessionDTO } from '../../application';

describe('AuthViewModelMapper', () => {
  it('maps AuthSessionDTO to AuthViewModel correctly', () => {
    const dto: AuthSessionDTO = {
      userId: 'usr-123',
      email: 'user@example.com',
      status: 'AUTHENTICATED',
      expiresAt: '2026-12-31T23:59:59.000Z',
      isAuthenticated: true,
    };

    const vm = AuthViewModelMapper.toViewModel(dto);

    expect(vm.userId).toBe('usr-123');
    expect(vm.userEmail).toBe('user@example.com');
    expect(vm.status).toBe('AUTHENTICATED');
    expect(vm.isAuthenticated).toBe(true);
    expect(vm.expiresAt).toBe('2026-12-31T23:59:59.000Z');
  });
});
