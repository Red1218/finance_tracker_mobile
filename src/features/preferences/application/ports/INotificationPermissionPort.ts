export type PermissionStatus = 'GRANTED' | 'NOT_REQUESTED' | 'DENIED';

export interface INotificationPermissionPort {
  checkPermissionStatus(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;
}
