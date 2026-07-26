import { IAuthProvider, LoginCredentials } from '../providers/IAuthProvider';
import { AuthSessionDTO, AuthSessionMapper } from '../dtos/AuthSessionDTO';
import { EmailAddress, AuthDomainError } from '../../domain';

export class LoginUseCase {
  constructor(private readonly authProvider: IAuthProvider) {
    Object.freeze(this);
  }

  public async execute(credentials: LoginCredentials): Promise<AuthSessionDTO> {
    if (!credentials.email || !credentials.password) {
      throw new AuthDomainError('INVALID_EMAIL', 'Email and password are required for login.');
    }

    // Validate email format at application boundary
    new EmailAddress(credentials.email);

    if (credentials.password.length < 6) {
      throw new AuthDomainError('UNAUTHENTICATED_ACCESS', 'Password must be at least 6 characters.');
    }

    const session = await this.authProvider.login(credentials);
    return AuthSessionMapper.toDTO(session);
  }
}
