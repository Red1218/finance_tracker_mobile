import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  // Authentication methods (login, logout, etc.) will be added in subsequent phases.
}
