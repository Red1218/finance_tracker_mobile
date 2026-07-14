import type { AuthChangeEvent, AuthError, Session, Subscription } from '@supabase/supabase-js';

import { supabase } from '@/src/platform/authentication/supabaseClient';

export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type AuthResult = Readonly<{
  error: AuthError | null;
}>;

export type AuthStateChangeListener = (event: AuthChangeEvent, session: Session | null) => void;

export const AuthService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  },

  onAuthStateChange(listener: AuthStateChangeListener): Subscription {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(listener);

    return subscription;
  },

  signIn(credentials: AuthCredentials): Promise<AuthResult> {
    return supabase.auth
      .signInWithPassword(credentials)
      .then(({ error }) => ({ error }));
  },

  signOut(): Promise<AuthResult> {
    return supabase.auth.signOut().then(({ error }) => ({ error }));
  },

  signUp(credentials: AuthCredentials, displayName?: string): Promise<AuthResult> {
    return supabase.auth
      .signUp({
        ...credentials,
        options: displayName ? { data: { display_name: displayName } } : undefined,
      })
      .then(({ error }) => ({ error }));
  },

  startAutoRefresh(): void {
    supabase.auth.startAutoRefresh();
  },

  stopAutoRefresh(): void {
    supabase.auth.stopAutoRefresh();
  },
};
