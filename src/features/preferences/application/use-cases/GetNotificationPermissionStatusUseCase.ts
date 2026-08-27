import { INotificationPermissionPort, PermissionStatus } from '../ports/INotificationPermissionPort';

export class GetNotificationPermissionStatusUseCase {
  constructor(private readonly permissionPort: INotificationPermissionPort) {
    Object.freeze(this);
  }

  public async execute(): Promise<PermissionStatus> {
    try {
      return await this.permissionPort.checkPermissionStatus();
    } catch {
      return 'NOT_REQUESTED';
    }
  }
}
