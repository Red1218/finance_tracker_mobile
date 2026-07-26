import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnqueueSyncOperationUseCase } from '../use-cases/EnqueueSyncOperationUseCase';
import { SyncStatus } from '../../domain';

describe('EnqueueSyncOperationUseCase', () => {
  let mockQueueRepo: any;
  let useCase: EnqueueSyncOperationUseCase;

  beforeEach(() => {
    mockQueueRepo = {
      enqueue: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new EnqueueSyncOperationUseCase(mockQueueRepo);
  });

  it('enqueues a new sync operation item into repository', async () => {
    const itemId = await useCase.execute({
      operationType: 'CREATE',
      entityType: 'TRANSACTION',
      entityId: 'tx-100',
      payloadSnapshot: { amount: 1500 },
      correlationId: 'test-correlation-id',
    });

    expect(itemId).toBeDefined();
    expect(mockQueueRepo.enqueue).toHaveBeenCalledTimes(1);
    const enqueuedItem = mockQueueRepo.enqueue.mock.calls[0][0];
    expect(enqueuedItem.operation.target.entityId).toBe('tx-100');
    expect(enqueuedItem.operation.correlationId).toBe('test-correlation-id');
    expect(enqueuedItem.status).toBe(SyncStatus.PENDING);
  });
});
