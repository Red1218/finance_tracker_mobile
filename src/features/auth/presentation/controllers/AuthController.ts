import { 
  LoginUseCase, 
  LogoutUseCase, 
  GetSessionUseCase, 
  RestoreSessionUseCase, 
  RefreshSessionUseCase,
  AuthCredentials 
} from '../../application';
import { AuthViewModel } from '../models/AuthViewModel';
import { AuthViewModelMapper } from '../mappers/AuthViewModelMapper';

export interface AuthState {
  viewModel: AuthViewModel;
  isLoading: boolean;
  error: string | null;
}

export class AuthController {
  private state: AuthState = {
    viewModel: {
      isAuthenticated: false,
      status: 'UNAUTHENTICATED',
      userId: null,
      userEmail: null,
      expiresAt: null,
    },
    isLoading: false,
    error: null,
  };

  private listeners: Set<() => void> = new Set();

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly restoreSessionUseCase: RestoreSessionUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase
  ) {}

  public getSnapshot = (): AuthState => {
    return this.state;
  };

  public getState(): AuthState {
    return this.state;
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    // React's useSyncExternalStore expects us to return an unsubscribe function.
    // It will call getSnapshot immediately after subscribing, so we don't need to call listener() here.
    return () => this.listeners.delete(listener);
  };

  private updateState(partialState: Partial<AuthState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener());
  }

  public async login(credentials: AuthCredentials): Promise<boolean> {
    this.updateState({ isLoading: true, error: null });
    try {
      const dto = await this.loginUseCase.execute(credentials);
      this.updateState({
        viewModel: AuthViewModelMapper.toViewModel(dto),
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      this.updateState({
        isLoading: false,
        error: e.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  }

  public async logout(): Promise<void> {
    this.updateState({ isLoading: true, error: null });
    try {
      await this.logoutUseCase.execute();
      const dto = await this.getSessionUseCase.execute();
      this.updateState({
        viewModel: AuthViewModelMapper.toViewModel(dto),
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      this.updateState({
        isLoading: false,
        error: e.message || 'Logout failed.',
      });
    }
  }

  public async restoreSession(): Promise<void> {
    this.updateState({ isLoading: true, error: null });
    try {
      const dto = await this.restoreSessionUseCase.execute();
      this.updateState({
        viewModel: AuthViewModelMapper.toViewModel(dto),
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      this.updateState({
        isLoading: false,
        error: e.message || 'Failed to restore session.',
      });
    }
  }

  public async refreshSession(): Promise<boolean> {
    this.updateState({ isLoading: true, error: null });
    try {
      const dto = await this.refreshSessionUseCase.execute();
      this.updateState({
        viewModel: AuthViewModelMapper.toViewModel(dto),
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      this.updateState({
        isLoading: false,
        error: e.message || 'Failed to refresh session.',
      });
      return false;
    }
  }
}
