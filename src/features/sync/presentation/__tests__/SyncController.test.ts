import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncController } from '../controllers/SyncController';

describe('SyncController', () => {
  let mockProcessSyncQueue: any;
  let mockResolveSyncConflict: any;
  let mockQueueRepo: any;
  let mockNetworkStatus: any;
  let controller: SyncController;

  beforeEach(() => {
    mockProcessSyncQueue = {
      execute: vi.fn().mockResolvedValue({ totalProcessed: 1, syncedCount: 1, failedCount: 0, conflictCount: 0 }),
    };
    mockResolveSyncConflict = {
      execute: vi.fn().mockResolvedValue(true),
    };
    mockQueueRepo = {
      getPendingItems: vi.fn().mockResolvedValue([]),
      getConflictItems: vi.fn().mockResolvedValue([]),
    };
    mockNetworkStatus = {
      isOnline: vi.fn().mockResolvedValue(true),
      subscribe: vi.fn().mockImplementation((cb: any) => {
        cb(true);
        return () => {};
      }),
    };

    controller = new SyncController(
      mockProcessSyncQueue,
      mockResolveSyncConflict,
      mockQueueRepo,
      mockNetworkStatus
    );
  });

  it('triggers synchronization when online', async () => {
    await controller.triggerSync();
    const state = controller.getState();

    expect(state.isSyncing).toBe(false);
    expect(state.error).toBeNull();
    expect(mockProcessSyncQueue.execute).toHaveBeenCalledTimes(1);
  });

  it('prevents synchronization when offline', async () => {
    mockNetworkStatus.isOnline.mockResolvedValue(false);

    await controller.triggerSync();
    const state = controller.getState();

    expect(state.error).toBe('Cannot synchronize while offline.');
    expect(mockProcessSyncQueue.execute).not.toHaveBeenCalled();
  });
});
