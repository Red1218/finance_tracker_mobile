import { INetworkStatusProvider } from '../../../features/sync/application';

export class NetworkStatusProviderImpl implements INetworkStatusProvider {
  private online = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  public async isOnline(): Promise<boolean> {
    return this.online;
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.online);
    return () => this.listeners.delete(listener);
  }

  public setOnlineStatus(online: boolean): void {
    this.online = online;
    this.listeners.forEach((listener) => listener(this.online));
  }
}
