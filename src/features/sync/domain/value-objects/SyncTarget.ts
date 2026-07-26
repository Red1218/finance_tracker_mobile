import { SyncDomainError } from '../errors/SyncDomainError';

export type SyncEntityType = 'ACCOUNT' | 'TRANSACTION' | 'CATEGORY' | 'BUDGET' | 'PREFERENCE';

export class SyncTarget {
  public readonly entityType: SyncEntityType;
  public readonly entityId: string;

  constructor(entityType: SyncEntityType, entityId: string) {
    if (!entityType) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Entity type is required for sync target.');
    }
    if (!entityId || entityId.trim().length === 0) {
      throw new SyncDomainError('INVALID_SYNC_PAYLOAD', 'Entity ID is required for sync target.');
    }

    this.entityType = entityType;
    this.entityId = entityId.trim();

    Object.freeze(this);
  }
}
