export interface INetworkStatusProviderPort {
  isOnline(): Promise<boolean>;
  subscribe(listener: (online: boolean) => void): () => void;
}
