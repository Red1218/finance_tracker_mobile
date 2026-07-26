import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResolveSyncConflictUseCase } from '../use-cases/ResolveSyncConflictUseCase';
import { SyncQueueItem, SyncOperation, SyncTarget, SyncStatus, SyncDomainError } from '../../domain';

describe('ResolveSyncConflictUseCase', () => {
  let mockQueueRepo: any;
  let useCase: ResolveSyncConflictUseCase;

  beforeEach(() => {
    mockQueueRepo = {
      getItemById: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new ResolveSyncConflictUseCase(mockQueueRepo);
  });

  it('resolves item in CONFLICT status by resetting to PENDING', async () => {
    const target = new SyncTarget('TRANSACTION', 'tx-1');
    const op = new SyncOperation({
      operationType: 'UPDATE',
      target,
      payloadSnapshot: { amount: 500 },
    });
    const item = new SyncQueueItem({ id: 'item-c1', operation: op });
    item.markInProgress();
    item.markConflict('Version mismatch');

    mockQueueRepo.getItemById.mockResolvedValue(item);

    const success = await useCase.execute({ itemId: 'item-c1' });

    expect(success).toBe(true);
    expect(item.status).toBe(SyncStatus.PENDING);
    expect(mockQueueRepo.update).toHaveBeenCalledWith(item);
  });

  it('throws SyncDomainError if item not in CONFLICT state', async () => {
    const target = new SyncTarget('TRANSACTION', 'tx-1');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { amount: 500 },
    });
    const item = new SyncQueueItem({ id: 'item-p1', operation: op });

    mockQueueRepo.getItemById.mockResolvedValue(item);

    await expect(useCase.execute({ itemId: 'item-p1' })).rejects.toThrow(SyncDomainError);
  });
});
