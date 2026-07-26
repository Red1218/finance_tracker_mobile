import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProcessSyncQueueUseCase } from '../use-cases/ProcessSyncQueueUseCase';
import { SyncQueueItem, SyncOperation, SyncTarget, SyncStatus } from '../../domain';

describe('ProcessSyncQueueUseCase', () => {
  let mockQueueRepo: any;
  let mockTransportProvider: any;
  let useCase: ProcessSyncQueueUseCase;

  beforeEach(() => {
    mockQueueRepo = {
      getPendingItems: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };
    mockTransportProvider = {
      pushOperation: vi.fn(),
    };
    useCase = new ProcessSyncQueueUseCase(mockQueueRepo, mockTransportProvider);
  });

  it('processes pending queue items and marks successful pushes as SYNCED', async () => {
    const target = new SyncTarget('ACCOUNT', 'acc-1');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { name: 'Savings' },
    });
    const item = new SyncQueueItem({ id: 'item-1', operation: op });

    mockQueueRepo.getPendingItems.mockResolvedValue([item]);
    mockTransportProvider.pushOperation.mockResolvedValue({ success: true });

    const result = await useCase.execute();

    expect(result.totalProcessed).toBe(1);
    expect(result.syncedCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(item.status).toBe(SyncStatus.SYNCED);
  });

  it('handles conflicts and marks items as CONFLICT status', async () => {
    const target = new SyncTarget('CATEGORY', 'cat-1');
    const op = new SyncOperation({
      operationType: 'UPDATE',
      target,
      payloadSnapshot: { name: 'Food' },
    });
    const item = new SyncQueueItem({ id: 'item-2', operation: op });

    mockQueueRepo.getPendingItems.mockResolvedValue([item]);
    mockTransportProvider.pushOperation.mockResolvedValue({
      success: false,
      conflict: true,
      error: 'Version mismatch',
    });

    const result = await useCase.execute();

    expect(result.totalProcessed).toBe(1);
    expect(result.conflictCount).toBe(1);
    expect(item.status).toBe(SyncStatus.CONFLICT);
  });
});
