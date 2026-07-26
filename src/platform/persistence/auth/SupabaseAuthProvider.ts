import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthProvider, AuthCredentials } from '../../../features/auth/application/providers/IAuthProvider';
import { UserSession, AuthDomainError } from '../../../features/auth/domain';
import { AuthMapper } from './AuthMapper';
import { supabase } from '../../../database';

export class SupabaseAuthProvider implements IAuthProvider {
  constructor(private readonly client: SupabaseClient = supabase) {
    Object.freeze(this);
  }

  public async login(credentials: AuthCredentials): Promise<UserSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session) {
      throw new AuthDomainError(
        'UNAUTHENTICATED_ACCESS',
        error?.message || 'Invalid email or password.'
      );
    }

    return AuthMapper.toDomain(data.session);
  }

  public async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new AuthDomainError('UNAUTHENTICATED_ACCESS', error.message);
    }
  }

  public async getSession(): Promise<UserSession> {
    const { data, error } = await this.client.auth.getSession();
    if (error || !data.session) {
      return UserSession.createUnauthenticated();
    }
    return AuthMapper.toDomain(data.session);
  }

  public async restoreSession(): Promise<UserSession> {
    return this.getSession();
  }

  public async refreshSession(): Promise<UserSession> {
    const { data, error } = await this.client.auth.refreshSession();
    if (error || !data.session) {
      throw new AuthDomainError(
        'EXPIRED_SESSION',
        error?.message || 'Failed to refresh session.'
      );
    }
    return AuthMapper.toDomain(data.session);
  }
}
