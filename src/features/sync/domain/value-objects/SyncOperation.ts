import { SyncTarget } from './SyncTarget';
import { SyncDomainError } from '../errors/SyncDomainError';

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VOID';

export class SyncOperation {
  public readonly operationType: SyncOperationType;
  public readonly target: SyncTarget;
  public readonly payloadSnapshot: Readonly<Record<string, unknown>>;
  public readonly timestamp: Date;
  public readonly correlationId: string;

  constructor(props: {
    operationType: SyncOperationType;
    target: SyncTarget;
    payloadSnapshot: Record<string, unknown>;
    timestamp?: Date;
    correlationId?: string;
  }) {
    if (!props.operationType) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Operation type is required.');
    }
    if (!props.target) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Sync target is required.');
    }
    if (!props.payloadSnapshot || typeof props.payloadSnapshot !== 'object') {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Payload snapshot must be a valid object.');
    }

    this.operationType = props.operationType;
    this.target = props.target;
    this.payloadSnapshot = Object.freeze({ ...props.payloadSnapshot });
    this.timestamp = props.timestamp ? new Date(props.timestamp.getTime()) : new Date();
    this.correlationId = props.correlationId || `sync-corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    Object.freeze(this);
  }
}
