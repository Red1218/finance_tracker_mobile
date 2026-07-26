import { describe, it, expect, beforeEach } from 'vitest';
import { SyncModule } from '../../composition/SyncModule';
import { SyncStatus, SyncOperation } from '../../domain';
import { InMemorySyncQueueRepository, NetworkStatusProviderImpl } from '../../../../platform/persistence/sync';

class MockSyncTransportProvider {
  public shouldFail = false;
  public shouldConflict = false;

  public async pushOperation(_op: SyncOperation) {
    if (this.shouldConflict) {
      return { success: false, conflict: true, error: 'Row modified by another session' };
    }
    if (this.shouldFail) {
      return { success: false, error: 'Network timeout' };
    }
    return { success: true };
  }
}

describe('Cloud Sync Engine — End-to-End Lifecycle Integration', () => {
  let queueRepo: InMemorySyncQueueRepository;
  let transportProvider: MockSyncTransportProvider;
  let networkProvider: NetworkStatusProviderImpl;
  let syncModule: SyncModule;

  beforeEach(() => {
    queueRepo = new InMemorySyncQueueRepository();
    transportProvider = new MockSyncTransportProvider();
    networkProvider = new NetworkStatusProviderImpl();
    syncModule = new SyncModule(queueRepo, transportProvider as any, networkProvider);
  });

  it('executes complete offline-to-online synchronization lifecycle', async () => {
    // 1. Initial State: Online & Empty Queue
    expect(syncModule.syncController.getState().viewModel.pendingCount).toBe(0);

    // 2. Enqueue Offline Mutation Operations
    const itemId1 = await syncModule.enqueueSyncOperationUseCase.execute({
      operationType: 'CREATE',
      entityType: 'ACCOUNT',
      entityId: 'acc-e2e-1',
      payloadSnapshot: { name: 'Checking Account', openingBalance: 5000 },
    });

    const itemId2 = await syncModule.enqueueSyncOperationUseCase.execute({
      operationType: 'CREATE',
      entityType: 'TRANSACTION',
      entityId: 'tx-e2e-1',
      payloadSnapshot: { amount: 1500, type: 'EXPENSE' },
    });

    await syncModule.syncController.refreshState();
    expect(syncModule.syncController.getState().viewModel.pendingCount).toBe(2);

    // 3. Process Queue while Network is Online
    await syncModule.syncController.triggerSync();

    const stateAfterSync = syncModule.syncController.getState();
    expect(stateAfterSync.viewModel.pendingCount).toBe(0);
    expect(stateAfterSync.viewModel.statusLabel).toBe('Synced');

    const item1 = await queueRepo.getItemById(itemId1);
    const item2 = await queueRepo.getItemById(itemId2);
    expect(item1?.status).toBe(SyncStatus.SYNCED);
    expect(item2?.status).toBe(SyncStatus.SYNCED);
  });

  it('handles conflict resolution workflow', async () => {
    // 1. Enqueue item that triggers conflict
    transportProvider.shouldConflict = true;

    const conflictItemId = await syncModule.enqueueSyncOperationUseCase.execute({
      operationType: 'UPDATE',
      entityType: 'PREFERENCE',
      entityId: 'pref-1',
      payloadSnapshot: { theme: 'DARK' },
    });

    await syncModule.syncController.triggerSync();

    const conflictItem = await queueRepo.getItemById(conflictItemId);
    expect(conflictItem?.status).toBe(SyncStatus.CONFLICT);

    await syncModule.syncController.refreshState();
    expect(syncModule.syncController.getState().viewModel.conflictCount).toBe(1);

    // 2. Resolve Conflict and Retry Sync
    transportProvider.shouldConflict = false;
    const resolveSuccess = await syncModule.syncController.resolveConflict(conflictItemId);
    expect(resolveSuccess).toBe(true);

    await syncModule.syncController.triggerSync();
    const resolvedItem = await queueRepo.getItemById(conflictItemId);
    expect(resolvedItem?.status).toBe(SyncStatus.SYNCED);
  });
});
