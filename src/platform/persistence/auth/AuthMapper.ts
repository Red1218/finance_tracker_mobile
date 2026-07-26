import { UserSession, UserId, EmailAddress, AuthStatus } from '../../../features/auth/domain';

export interface SupabaseAuthSessionPayload {
  user?: {
    id?: string;
    email?: string;
  } | null;
  expires_at?: number | null;
  expires_in?: number | null;
}

export class AuthMapper {
  public static toDomain(payload: SupabaseAuthSessionPayload | null): UserSession {
    if (!payload || !payload.user || !payload.user.id || !payload.user.email) {
      return UserSession.createUnauthenticated();
    }

    const userId = new UserId(payload.user.id);
    const email = new EmailAddress(payload.user.email);
    
    let expiresAt: Date;
    if (payload.expires_at) {
      expiresAt = new Date(payload.expires_at * 1000);
    } else if (payload.expires_in) {
      expiresAt = new Date(Date.now() + payload.expires_in * 1000);
    } else {
      expiresAt = new Date(Date.now() + 3600 * 1000);
    }

    const session = UserSession.createAuthenticated({
      userId,
      email,
      expiresAt,
    });

    if (session.isExpired()) {
      return new UserSession({
        userId,
        email,
        status: AuthStatus.EXPIRED,
        expiresAt,
      });
    }

    return session;
  }
}
