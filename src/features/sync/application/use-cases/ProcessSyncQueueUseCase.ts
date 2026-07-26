import { ISyncQueueRepository } from '../repositories/ISyncQueueRepository';
import { ISyncTransportProvider } from '../providers/ISyncTransportProvider';

export interface SyncProcessResultDTO {
  totalProcessed: number;
  syncedCount: number;
  failedCount: number;
  conflictCount: number;
}

export class ProcessSyncQueueUseCase {
  constructor(
    private readonly queueRepository: ISyncQueueRepository,
    private readonly transportProvider: ISyncTransportProvider
  ) {
    Object.freeze(this);
  }

  public async execute(): Promise<SyncProcessResultDTO> {
    const pendingItems = await this.queueRepository.getPendingItems();

    let syncedCount = 0;
    let failedCount = 0;
    let conflictCount = 0;

    for (const item of pendingItems) {
      try {
        item.markInProgress();
        await this.queueRepository.update(item);

        const result = await this.transportProvider.pushOperation(item.operation);

        if (result.success) {
          item.markSynced();
          syncedCount++;
        } else if (result.conflict) {
          item.markConflict(result.error || 'Server conflict detected');
          conflictCount++;
        } else {
          item.markFailed(result.error || 'Push failed');
          failedCount++;
        }

        await this.queueRepository.update(item);
      } catch (err: any) {
        item.markFailed(err?.message || 'Unexpected sync error');
        await this.queueRepository.update(item);
        failedCount++;
      }
    }

    return {
      totalProcessed: pendingItems.length,
      syncedCount,
      failedCount,
      conflictCount,
    };
  }
}
