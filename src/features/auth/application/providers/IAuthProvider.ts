import { UserSession } from '../../domain';

export interface AuthCredentials {
  email: string;
  password: string;
}

export type LoginCredentials = AuthCredentials;

export interface IAuthProvider {
  login(credentials: AuthCredentials): Promise<UserSession>;
  logout(): Promise<void>;
  getSession(): Promise<UserSession>;
  restoreSession(): Promise<UserSession>;
  refreshSession(): Promise<UserSession>;
}
