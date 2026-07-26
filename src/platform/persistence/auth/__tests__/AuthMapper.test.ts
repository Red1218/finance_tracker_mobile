import { describe, it, expect } from 'vitest';
import { AuthMapper, SupabaseAuthSessionPayload } from '../AuthMapper';
import { AuthStatus } from '../../../../features/auth/domain';

describe('AuthMapper', () => {
  it('maps valid Supabase payload to authenticated UserSession', () => {
    const payload: SupabaseAuthSessionPayload = {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
      },
      expires_in: 3600,
    };

    const session = AuthMapper.toDomain(payload);

    expect(session.status).toBe(AuthStatus.AUTHENTICATED);
    expect(session.userId?.value).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(session.email?.value).toBe('user@example.com');
    expect(session.isAuthenticated).toBe(true);
  });

  it('maps null or incomplete payload to unauthenticated UserSession', () => {
    expect(AuthMapper.toDomain(null).status).toBe(AuthStatus.UNAUTHENTICATED);
    expect(AuthMapper.toDomain({ user: null }).status).toBe(AuthStatus.UNAUTHENTICATED);
    expect(AuthMapper.toDomain({ user: { id: 'usr-1' } }).status).toBe(AuthStatus.UNAUTHENTICATED);
  });

  it('maps expired payload to EXPIRED status UserSession', () => {
    const payload: SupabaseAuthSessionPayload = {
      user: {
        id: 'usr-1',
        email: 'expired@example.com',
      },
      expires_at: Math.floor((Date.now() - 5000) / 1000), // 5 seconds ago
    };

    const session = AuthMapper.toDomain(payload);
    expect(session.status).toBe(AuthStatus.EXPIRED);
    expect(session.isExpired()).toBe(true);
  });
});
