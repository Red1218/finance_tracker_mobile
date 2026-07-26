import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySyncQueueRepository } from '../InMemorySyncQueueRepository';
import { SyncQueueItem, SyncOperation, SyncTarget, SyncStatus } from '../../../../features/sync/domain';

describe('InMemorySyncQueueRepository', () => {
  let repo: InMemorySyncQueueRepository;

  beforeEach(() => {
    repo = new InMemorySyncQueueRepository();
  });

  it('enqueues, retrieves pending items, and updates sync items', async () => {
    const target = new SyncTarget('TRANSACTION', 'tx-1');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { amount: 100 },
    });
    const item = new SyncQueueItem({ id: 'item-1', operation: op });

    await repo.enqueue(item);
    const pending = await repo.getPendingItems();

    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('item-1');

    item.markInProgress();
    item.markSynced();
    await repo.update(item);

    const pendingAfterSync = await repo.getPendingItems();
    expect(pendingAfterSync).toHaveLength(0);
  });
});
