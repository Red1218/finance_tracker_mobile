import { SyncOperation } from '../value-objects/SyncOperation';
import { SyncStatus, SyncConflictStrategy } from '../value-objects/SyncStatus';
import { SyncDomainError } from '../errors/SyncDomainError';

export interface SyncQueueItemProps {
  id: string;
  operation: SyncOperation;
  status?: SyncStatus;
  retryCount?: number;
  maxRetries?: number;
  lastAttemptedAt?: Date | null;
  errorReason?: string | null;
  conflictStrategy?: SyncConflictStrategy;
}

export class SyncQueueItem {
  public readonly id: string;
  public readonly operation: SyncOperation;
  private _status: SyncStatus;
  private _retryCount: number;
  public readonly maxRetries: number;
  private _lastAttemptedAt: Date | null;
  private _errorReason: string | null;
  public readonly conflictStrategy: SyncConflictStrategy;

  constructor(props: SyncQueueItemProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Sync queue item ID is required.');
    }
    if (!props.operation) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Sync operation is required.');
    }

    this.id = props.id.trim();
    this.operation = props.operation;
    this._status = props.status ?? SyncStatus.PENDING;
    this._retryCount = props.retryCount ?? 0;
    this.maxRetries = props.maxRetries ?? 3;
    this._lastAttemptedAt = props.lastAttemptedAt ?? null;
    this._errorReason = props.errorReason ?? null;
    this.conflictStrategy = props.conflictStrategy ?? SyncConflictStrategy.SERVER_WINS;
  }

  public get status(): SyncStatus {
    return this._status;
  }

  public get retryCount(): number {
    return this._retryCount;
  }

  public get lastAttemptedAt(): Date | null {
    return this._lastAttemptedAt;
  }

  public get errorReason(): string | null {
    return this._errorReason;
  }

  public markInProgress(): void {
    if (this._status === SyncStatus.SYNCED) {
      throw new SyncDomainError('INVALID_STATUS_TRANSITION', 'Synced items are immutable and cannot re-enter progress.');
    }
    if (this._status === SyncStatus.CONFLICT) {
      throw new SyncDomainError('INVALID_STATUS_TRANSITION', 'Items in CONFLICT status cannot retry until resolved.');
    }

    this._status = SyncStatus.IN_PROGRESS;
    this._lastAttemptedAt = new Date();
  }

  public markSynced(): void {
    if (this._status !== SyncStatus.IN_PROGRESS) {
      throw new SyncDomainError('INVALID_STATUS_TRANSITION', 'Only IN_PROGRESS items can be marked as SYNCED.');
    }
    this._status = SyncStatus.SYNCED;
    this._errorReason = null;
  }

  public markFailed(reason: string): void {
    if (this._status !== SyncStatus.IN_PROGRESS) {
      throw new SyncDomainError('INVALID_STATUS_TRANSITION', 'Only IN_PROGRESS items can mark failure.');
    }

    this._retryCount += 1;
    this._errorReason = reason;

    if (this._retryCount >= this.maxRetries) {
      this._status = SyncStatus.FAILED;
    } else {
      this._status = SyncStatus.PENDING; // Allowed to retry
    }
  }

  public markConflict(reason?: string): void {
    if (this._status === SyncStatus.SYNCED) {
      throw new SyncDomainError('INVALID_STATUS_TRANSITION', 'Synced items cannot enter CONFLICT.');
    }
    this._status = SyncStatus.CONFLICT;
    if (reason) this._errorReason = reason;
  }
}
