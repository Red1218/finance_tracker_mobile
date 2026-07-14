import React, { ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import type { AuthState } from './auth.types';
import { supabase } from '../../database';
import { logger } from '../../core/logger';

export type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

const buildState = (session: Session | null): AuthState => ({
  user: session?.user ?? null,
  isLoading: false,
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
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
        }));
      })
      .catch((error) => {
        if (!isMounted) return;

        logger.error('Unexpected error during session restoration', undefined, error);
        setState((prevState) => ({
          ...prevState,
          ...buildState(null),
        }));
      });

    // 2. Listen for ongoing authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setState((prevState) => ({
        ...prevState,
        ...buildState(session),
      }));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
