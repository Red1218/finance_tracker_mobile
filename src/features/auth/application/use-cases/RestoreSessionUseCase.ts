import { IAuthProvider } from '../providers/IAuthProvider';
import { AuthSessionDTO, AuthSessionMapper } from '../dtos/AuthSessionDTO';

export class RestoreSessionUseCase {
  constructor(private readonly authProvider: IAuthProvider) {
    Object.freeze(this);
  }

  public async execute(): Promise<AuthSessionDTO> {
    const session = await this.authProvider.restoreSession();
    return AuthSessionMapper.toDTO(session);
  }
}
