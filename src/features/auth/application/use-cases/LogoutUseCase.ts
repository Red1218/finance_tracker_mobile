import { IAuthProvider } from '../providers/IAuthProvider';

export class LogoutUseCase {
  constructor(private readonly authProvider: IAuthProvider) {
    Object.freeze(this);
  }

  public async execute(): Promise<void> {
    await this.authProvider.logout();
  }
}
