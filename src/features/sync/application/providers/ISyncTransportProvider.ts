import { SyncOperation } from '../../domain';

export interface TransportPushResult {
  success: boolean;
  conflict?: boolean;
  error?: string;
}

export interface ISyncTransportProvider {
  pushOperation(operation: SyncOperation): Promise<TransportPushResult>;
}
