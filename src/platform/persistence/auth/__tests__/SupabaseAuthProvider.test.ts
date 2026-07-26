import { describe, it, expect, vi } from 'vitest';
import { SupabaseAuthProvider } from '../SupabaseAuthProvider';
import { AuthStatus, AuthDomainError } from '../../../../features/auth/domain';

describe('SupabaseAuthProvider', () => {
  const createMockClient = (options: {
    sessionData?: any;
    signInError?: any;
    signOutError?: any;
  }) => {
    return {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: options.sessionData || null },
          error: options.signInError || null,
        }),
        signOut: vi.fn().mockResolvedValue({
          error: options.signOutError || null,
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: options.sessionData || null },
          error: null,
        }),
        refreshSession: vi.fn().mockResolvedValue({
          data: { session: options.sessionData || null },
          error: options.signInError || null,
        }),
      },
    } as any;
  };

  it('logs in successfully and returns mapped UserSession', async () => {
    const mockClient = createMockClient({
      sessionData: {
        user: { id: 'usr-supabase-1', email: 'supabase@example.com' },
        expires_in: 3600,
      },
    });

    const provider = new SupabaseAuthProvider(mockClient);
    const session = await provider.login({ email: 'supabase@example.com', password: 'secret-password' });

    expect(session.status).toBe(AuthStatus.AUTHENTICATED);
    expect(session.userId?.value).toBe('usr-supabase-1');
  });

  it('throws AuthDomainError on invalid password', async () => {
    const mockClient = createMockClient({
      signInError: { message: 'Invalid login credentials' },
    });

    const provider = new SupabaseAuthProvider(mockClient);
    await expect(
      provider.login({ email: 'user@example.com', password: 'wrong' })
    ).rejects.toThrow(AuthDomainError);
  });

  it('returns unauthenticated UserSession when getSession returns null', async () => {
    const mockClient = createMockClient({ sessionData: null });
    const provider = new SupabaseAuthProvider(mockClient);
    const session = await provider.getSession();

    expect(session.status).toBe(AuthStatus.UNAUTHENTICATED);
  });
});
