import { IAuthProvider, LoginCredentials } from '../providers/IAuthProvider';
import { UserSession, UserId, EmailAddress, AuthDomainError } from '../../domain';

export class InMemoryAuthProvider implements IAuthProvider {
  private currentSession: UserSession = UserSession.createUnauthenticated();

  public async login(credentials: LoginCredentials): Promise<UserSession> {
    if (credentials.password === 'wrong-password') {
      throw new AuthDomainError('UNAUTHENTICATED_ACCESS', 'Invalid email or password.');
    }

    const userId = new UserId('user-uuid-123');
    const email = new EmailAddress(credentials.email);
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    this.currentSession = UserSession.createAuthenticated({
      userId,
      email,
      expiresAt,
    });

    return this.currentSession;
  }

  public async logout(): Promise<void> {
    this.currentSession = UserSession.createUnauthenticated();
  }

  public async getSession(): Promise<UserSession> {
    return this.currentSession;
  }

  public async restoreSession(): Promise<UserSession> {
    return this.currentSession;
  }

  public async refreshSession(): Promise<UserSession> {
    if (!this.currentSession.isAuthenticated) {
      throw new AuthDomainError('UNAUTHENTICATED_ACCESS', 'No active session to refresh.');
    }

    const newExpiresAt = new Date(Date.now() + 7200 * 1000);
    this.currentSession = this.currentSession.refresh(newExpiresAt);
    return this.currentSession;
  }

  // Test seed helper
  public seedSession(session: UserSession): void {
    this.currentSession = session;
  }
}
