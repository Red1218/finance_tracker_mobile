import { ISyncQueueRepository } from '../../../features/sync/application';
import { SyncQueueItem, SyncStatus } from '../../../features/sync/domain';

export class InMemorySyncQueueRepository implements ISyncQueueRepository {
  private items: Map<string, SyncQueueItem> = new Map();

  public async enqueue(item: SyncQueueItem): Promise<void> {
    this.items.set(item.id, item);
  }

  public async getPendingItems(): Promise<SyncQueueItem[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.status === SyncStatus.PENDING
    );
  }

  public async getItemById(id: string): Promise<SyncQueueItem | null> {
    return this.items.get(id) ?? null;
  }

  public async update(item: SyncQueueItem): Promise<void> {
    this.items.set(item.id, item);
  }

  public async getConflictItems(): Promise<SyncQueueItem[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.status === SyncStatus.CONFLICT
    );
  }
}
