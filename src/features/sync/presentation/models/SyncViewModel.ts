export interface SyncViewModel {
  isOnline: boolean;
  pendingCount: number;
  conflictCount: number;
  failedCount: number;
  lastSyncedFormatted: string;
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'red' | 'gray';
}
