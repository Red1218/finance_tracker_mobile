import { SyncQueueItem } from '../../domain';

export interface ISyncQueueRepository {
  enqueue(item: SyncQueueItem): Promise<void>;
  getPendingItems(): Promise<SyncQueueItem[]>;
  getItemById(id: string): Promise<SyncQueueItem | null>;
  update(item: SyncQueueItem): Promise<void>;
  getConflictItems(): Promise<SyncQueueItem[]>;
}
