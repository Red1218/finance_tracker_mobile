import { IAuthProvider } from '../application/providers/IAuthProvider';
import { SupabaseAuthProvider } from '../infrastructure';
import { 
  LoginUseCase, 
  LogoutUseCase, 
  GetSessionUseCase, 
  RestoreSessionUseCase, 
  RefreshSessionUseCase 
} from '../application/use-cases';
import { AuthController } from '../presentation/controllers/AuthController';

export class AuthModule {
  public readonly authProvider: IAuthProvider;
  public readonly loginUseCase: LoginUseCase;
  public readonly logoutUseCase: LogoutUseCase;
  public readonly getSessionUseCase: GetSessionUseCase;
  public readonly restoreSessionUseCase: RestoreSessionUseCase;
  public readonly refreshSessionUseCase: RefreshSessionUseCase;
  public readonly authController: AuthController;

  constructor(provider?: IAuthProvider) {
    this.authProvider = provider ?? new SupabaseAuthProvider();
    this.loginUseCase = new LoginUseCase(this.authProvider);
    this.logoutUseCase = new LogoutUseCase(this.authProvider);
    this.getSessionUseCase = new GetSessionUseCase(this.authProvider);
    this.restoreSessionUseCase = new RestoreSessionUseCase(this.authProvider);
    this.refreshSessionUseCase = new RefreshSessionUseCase(this.authProvider);

    this.authController = new AuthController(
      this.loginUseCase,
      this.logoutUseCase,
      this.getSessionUseCase,
      this.restoreSessionUseCase,
      this.refreshSessionUseCase
    );

    Object.freeze(this);
  }
}

export const authModule = new AuthModule();
