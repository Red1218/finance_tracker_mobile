import type { AuthError, Session, User } from '@supabase/supabase-js';

export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type AuthResult = Readonly<{
  error: AuthError | null;
}>;

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
}
