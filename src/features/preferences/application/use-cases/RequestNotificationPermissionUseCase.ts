import { INotificationPermissionPort, PermissionStatus } from '../ports/INotificationPermissionPort';

export class RequestNotificationPermissionUseCase {
  constructor(private readonly permissionPort: INotificationPermissionPort) {
    Object.freeze(this);
  }

  public async execute(): Promise<PermissionStatus> {
    try {
      return await this.permissionPort.requestPermission();
    } catch {
      return 'DENIED';
    }
  }
}
