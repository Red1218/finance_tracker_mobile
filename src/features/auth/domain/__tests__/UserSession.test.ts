import { describe, it, expect } from 'vitest';
import { UserSession } from '../entities/UserSession';
import { UserId } from '../value-objects/UserId';
import { EmailAddress } from '../value-objects/EmailAddress';
import { AuthStatus } from '../value-objects/AuthStatus';
import { AuthDomainError } from '../errors/AuthDomainError';

describe('UserSession Aggregate Root', () => {
  const validUserId = new UserId('usr-123');
  const validEmail = new EmailAddress('user@example.com');
  const futureExpiration = new Date('2026-12-31T23:59:59Z');
  const pastExpiration = new Date('2026-01-01T00:00:00Z');

  it('creates an active authenticated session', () => {
    const session = UserSession.createAuthenticated({
      userId: validUserId,
      email: validEmail,
      expiresAt: futureExpiration,
    });

    expect(session.status).toBe(AuthStatus.AUTHENTICATED);
    expect(session.userId?.value).toBe('usr-123');
    expect(session.email?.value).toBe('user@example.com');
    expect(session.isAuthenticated).toBe(true);
  });

  it('creates an unauthenticated session', () => {
    const session = UserSession.createUnauthenticated();

    expect(session.status).toBe(AuthStatus.UNAUTHENTICATED);
    expect(session.userId).toBeNull();
    expect(session.email).toBeNull();
    expect(session.isAuthenticated).toBe(false);
  });

  it('throws when creating an authenticated session without userId or email', () => {
    expect(() =>
      UserSession.createAuthenticated({
        userId: null as any,
        email: validEmail,
        expiresAt: futureExpiration,
      })
    ).toThrow(AuthDomainError);

    expect(() =>
      UserSession.createAuthenticated({
        userId: validUserId,
        email: null as any,
        expiresAt: futureExpiration,
      })
    ).toThrow(AuthDomainError);
  });

  it('evaluates session expiration correctly', () => {
    const activeSession = UserSession.createAuthenticated({
      userId: validUserId,
      email: validEmail,
      expiresAt: new Date('2026-06-01T12:00:00Z'),
    });

    expect(activeSession.isExpired(new Date('2026-06-01T11:59:59Z'))).toBe(false);
    expect(activeSession.isExpired(new Date('2026-06-01T12:00:01Z'))).toBe(true);
  });

  it('allows refreshing an active session with a new expiration date', () => {
    const session = UserSession.createAuthenticated({
      userId: validUserId,
      email: validEmail,
      expiresAt: new Date('2026-06-01T12:00:00Z'),
    });

    const newExpiration = new Date('2026-06-01T18:00:00Z');
    const refreshed = session.refresh(newExpiration, new Date('2026-06-01T10:00:00Z'));

    expect(refreshed.status).toBe(AuthStatus.AUTHENTICATED);
    expect(refreshed.expiresAt).toEqual(newExpiration);
  });

  it('rejects refreshing an expired session', () => {
    const session = UserSession.createAuthenticated({
      userId: validUserId,
      email: validEmail,
      expiresAt: new Date('2026-06-01T12:00:00Z'),
    });

    expect(() =>
      session.refresh(new Date('2026-06-01T18:00:00Z'), new Date('2026-06-01T13:00:00Z'))
    ).toThrow(AuthDomainError);
  });

  it('rejects refreshing an unauthenticated session', () => {
    const session = UserSession.createUnauthenticated();

    expect(() =>
      session.refresh(futureExpiration)
    ).toThrow(AuthDomainError);
  });

  it('invalidates a session transitioning to UNAUTHENTICATED', () => {
    const session = UserSession.createAuthenticated({
      userId: validUserId,
      email: validEmail,
      expiresAt: futureExpiration,
    });

    const invalidated = session.invalidate();

    expect(invalidated.status).toBe(AuthStatus.UNAUTHENTICATED);
    expect(invalidated.isAuthenticated).toBe(false);
  });
});
