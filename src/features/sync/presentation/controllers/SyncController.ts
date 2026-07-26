import { 
  ProcessSyncQueueUseCase, 
  ResolveSyncConflictUseCase, 
  ISyncQueueRepository, 
  INetworkStatusProvider 
} from '../../application';
import { SyncViewModel } from '../models/SyncViewModel';
import { SyncViewModelMapper } from '../mappers/SyncViewModelMapper';

export interface SyncState {
  viewModel: SyncViewModel;
  isSyncing: boolean;
  error: string | null;
}

export class SyncController {
  private state: SyncState = {
    viewModel: {
      isOnline: true,
      pendingCount: 0,
      conflictCount: 0,
      failedCount: 0,
      lastSyncedFormatted: 'Never',
      statusLabel: 'Synced',
      statusColor: 'emerald',
    },
    isSyncing: false,
    error: null,
  };

  private listeners: Set<(state: SyncState) => void> = new Set();
  private lastSyncedAt: Date | null = null;

  constructor(
    private readonly processSyncQueueUseCase: ProcessSyncQueueUseCase,
    private readonly resolveSyncConflictUseCase: ResolveSyncConflictUseCase,
    private readonly queueRepository: ISyncQueueRepository,
    private readonly networkStatusProvider: INetworkStatusProvider
  ) {
    this.networkStatusProvider.subscribe(async () => {
      await this.refreshState();
    });
  }

  public getState(): SyncState {
    return this.state;
  }

  public subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partialState: Partial<SyncState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public async refreshState(): Promise<void> {
    const isOnline = await this.networkStatusProvider.isOnline();
    const pendingItems = await this.queueRepository.getPendingItems();
    const conflictItems = await this.queueRepository.getConflictItems();

    const vm = SyncViewModelMapper.toViewModel({
      isOnline,
      pendingCount: pendingItems.length,
      conflictCount: conflictItems.length,
      failedCount: 0,
      lastSyncedAt: this.lastSyncedAt,
    });

    this.updateState({ viewModel: vm });
  }

  public async triggerSync(): Promise<void> {
    const isOnline = await this.networkStatusProvider.isOnline();
    if (!isOnline) {
      this.updateState({ error: 'Cannot synchronize while offline.' });
      return;
    }

    this.updateState({ isSyncing: true, error: null });
    try {
      const result = await this.processSyncQueueUseCase.execute();
      if (result.syncedCount > 0) {
        this.lastSyncedAt = new Date();
      }
      await this.refreshState();
      this.updateState({ isSyncing: false, error: null });
    } catch (err: any) {
      this.updateState({
        isSyncing: false,
        error: err?.message || 'Sync failed.',
      });
    }
  }

  public async resolveConflict(itemId: string): Promise<boolean> {
    try {
      const success = await this.resolveSyncConflictUseCase.execute({ itemId });
      await this.refreshState();
      return success;
    } catch (err: any) {
      this.updateState({ error: err?.message || 'Failed to resolve conflict.' });
      return false;
    }
  }
}
