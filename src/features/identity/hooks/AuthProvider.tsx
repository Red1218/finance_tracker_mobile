import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { AuthContext } from '@/src/features/identity/hooks/AuthContext';
import { AuthService } from '@/src/features/identity/services/AuthService';

type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const subscription = AuthService.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setError(null);
      setLoading(false);
    });

    async function restoreSession() {
      try {
        const restoredSession = await AuthService.getSession();
        setSession(restoredSession);
        setUser(restoredSession?.user ?? null);
      } catch (sessionError) {
        setError(sessionError instanceof Error ? sessionError : new Error('Unable to restore session.'));
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        error,
        loading,
        session,
        signIn: (email, password) => AuthService.signIn({ email, password }),
        signOut: AuthService.signOut,
        signUp: (email, password, displayName) => AuthService.signUp({ email, password }, displayName),
        user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
