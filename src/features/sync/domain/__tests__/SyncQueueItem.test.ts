import { describe, it, expect } from 'vitest';
import { SyncQueueItem } from '../entities/SyncQueueItem';
import { SyncOperation } from '../value-objects/SyncOperation';
import { SyncTarget } from '../value-objects/SyncTarget';
import { SyncStatus } from '../value-objects/SyncStatus';
import { SyncDomainError } from '../errors/SyncDomainError';

describe('SyncQueueItem Aggregate Root', () => {
  const createTestItem = (maxRetries = 3) => {
    const target = new SyncTarget('TRANSACTION', 'tx-100');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { amount: 2500 },
    });
    return new SyncQueueItem({ id: 'item-1', operation: op, maxRetries });
  };

  it('initializes in PENDING status with 0 retries', () => {
    const item = createTestItem();
    expect(item.id).toBe('item-1');
    expect(item.status).toBe(SyncStatus.PENDING);
    expect(item.retryCount).toBe(0);
  });

  it('transitions state machine: PENDING -> IN_PROGRESS -> SYNCED', () => {
    const item = createTestItem();

    item.markInProgress();
    expect(item.status).toBe(SyncStatus.IN_PROGRESS);
    expect(item.lastAttemptedAt).not.toBeNull();

    item.markSynced();
    expect(item.status).toBe(SyncStatus.SYNCED);
  });

  it('prevents state transitions from SYNCED items (immutability invariant)', () => {
    const item = createTestItem();
    item.markInProgress();
    item.markSynced();

    expect(() => item.markInProgress()).toThrow(SyncDomainError);
    expect(() => item.markConflict()).toThrow(SyncDomainError);
  });

  it('increments retryCount on failure and marks FAILED when maxRetries reached', () => {
    const item = createTestItem(2); // Max 2 retries

    // Attempt 1 Failure -> returns to PENDING
    item.markInProgress();
    item.markFailed('Timeout');
    expect(item.retryCount).toBe(1);
    expect(item.status).toBe(SyncStatus.PENDING);

    // Attempt 2 Failure -> transitions to FAILED
    item.markInProgress();
    item.markFailed('Timeout');
    expect(item.retryCount).toBe(2);
    expect(item.status).toBe(SyncStatus.FAILED);
  });

  it('transitions to CONFLICT and prevents automatic retry without resolution', () => {
    const item = createTestItem();
    item.markInProgress();
    item.markConflict('Version mismatch');

    expect(item.status).toBe(SyncStatus.CONFLICT);
    expect(item.errorReason).toBe('Version mismatch');

    expect(() => item.markInProgress()).toThrow(SyncDomainError);
  });
});
