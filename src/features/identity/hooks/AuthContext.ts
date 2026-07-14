import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import type { AuthResult } from '@/src/features/identity/services/AuthService';

export type AuthContextValue = Readonly<{
  error: Error | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  user: User | null;
}>;

export const AuthContext = createContext<AuthContextValue | null>(null);
