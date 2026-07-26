export interface INetworkStatusProvider {
  isOnline(): Promise<boolean>;
  subscribe(listener: (isOnline: boolean) => void): () => void;
}
