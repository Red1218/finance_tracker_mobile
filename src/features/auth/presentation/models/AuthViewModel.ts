export interface AuthViewModel {
  isAuthenticated: boolean;
  status: string;
  userId: string | null;
  userEmail: string | null;
  expiresAt: string | null;
}
