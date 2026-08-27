import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { INetworkStatusProviderPort } from '../../../features/sync/application/ports/INetworkStatusProviderPort';

export class NetInfoNetworkStatusProvider implements INetworkStatusProviderPort {
  public async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!(state.isConnected && state.isInternetReachable !== false);
  }

  public subscribe(listener: (online: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      listener(online);
    });

    return unsubscribe;
  }
}
