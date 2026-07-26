import { SyncViewModel } from '../models/SyncViewModel';

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  conflictCount: number;
  failedCount: number;
  lastSyncedAt: Date | null;
}

export class SyncViewModelMapper {
  public static toViewModel(stats: SyncStats): SyncViewModel {
    let statusLabel = 'Synced';
    let statusColor: 'emerald' | 'amber' | 'red' | 'gray' = 'emerald';

    if (!stats.isOnline) {
      statusLabel = 'Offline';
      statusColor = 'gray';
    } else if (stats.conflictCount > 0) {
      statusLabel = `${stats.conflictCount} Conflict${stats.conflictCount > 1 ? 's' : ''}`;
      statusColor = 'red';
    } else if (stats.failedCount > 0) {
      statusLabel = `${stats.failedCount} Failed`;
      statusColor = 'red';
    } else if (stats.pendingCount > 0) {
      statusLabel = `${stats.pendingCount} Pending`;
      statusColor = 'amber';
    }

    const lastSyncedFormatted = stats.lastSyncedAt
      ? stats.lastSyncedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'Never';

    return {
      isOnline: stats.isOnline,
      pendingCount: stats.pendingCount,
      conflictCount: stats.conflictCount,
      failedCount: stats.failedCount,
      lastSyncedFormatted,
      statusLabel,
      statusColor,
    };
  }
}
