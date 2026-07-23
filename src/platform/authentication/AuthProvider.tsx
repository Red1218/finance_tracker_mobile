import React, { ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import type { AuthState, AuthResult } from './auth.types';
import { supabase } from '../../database';
import { logger } from '../../core/logger';
import { AuthRedirectService } from './AuthRedirectService';

export type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

const buildState = (session: Session | null): Pick<AuthState, 'user' | 'session'> => ({
  user: session?.user ?? null,
  session: session,
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Restore the initial session on startup
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          logger.error('Failed to restore authentication session', undefined, error);
        }
        
        setState((prevState) => ({
          ...prevState,
          ...buildState(data.session),
          loading: false,
          error: error instanceof Error ? error : (error ? new Error((error as any).message || String(error)) : null),
        }));
      })
      .catch((error) => {
        if (!isMounted) return;

        logger.error('Unexpected error during session restoration', undefined, error);
        setState((prevState) => ({
          ...prevState,
          ...buildState(null),
          loading: false,
          error: error instanceof Error ? error : new Error('Unable to restore session.'),
        }));
      });

    // 2. Listen for ongoing authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setState((prevState) => ({
        ...prevState,
        ...buildState(session),
        loading: false,
        error: null,
      }));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    const options: any = {
      emailRedirectTo: AuthRedirectService.getRedirectUrl(),
    };
    if (displayName) {
      options.data = { display_name: displayName };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signOut,
      signUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
