import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUseCase } from '../use-cases/LoginUseCase';
import { InMemoryAuthProvider } from './InMemoryAuthProvider';
import { AuthDomainError } from '../../domain';

describe('LoginUseCase', () => {
  let provider: InMemoryAuthProvider;
  let useCase: LoginUseCase;

  beforeEach(() => {
    provider = new InMemoryAuthProvider();
    useCase = new LoginUseCase(provider);
  });

  it('successfully logs in with valid credentials and returns AuthSessionDTO', async () => {
    const dto = await useCase.execute({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(dto.isAuthenticated).toBe(true);
    expect(dto.userId).toBe('user-uuid-123');
    expect(dto.email).toBe('user@example.com');
    expect(dto.status).toBe('AUTHENTICATED');
  });

  it('rejects invalid email formats at boundary', async () => {
    await expect(
      useCase.execute({
        email: 'not-an-email',
        password: 'password123',
      })
    ).rejects.toThrow(AuthDomainError);
  });

  it('rejects short passwords', async () => {
    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: '123',
      })
    ).rejects.toThrow(AuthDomainError);
  });

  it('handles invalid credentials failure from provider', async () => {
    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow(AuthDomainError);
  });
});
