import { IAuthProvider } from '../providers/IAuthProvider';
import { AuthSessionDTO, AuthSessionMapper } from '../dtos/AuthSessionDTO';

export class GetSessionUseCase {
  constructor(private readonly authProvider: IAuthProvider) {
    Object.freeze(this);
  }

  public async execute(): Promise<AuthSessionDTO> {
    const session = await this.authProvider.getSession();
    return AuthSessionMapper.toDTO(session);
  }
}
