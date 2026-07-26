import { describe, it, expect } from 'vitest';
import { SyncViewModelMapper } from '../mappers/SyncViewModelMapper';

describe('SyncViewModelMapper', () => {
  it('maps online synced state cleanly', () => {
    const vm = SyncViewModelMapper.toViewModel({
      isOnline: true,
      pendingCount: 0,
      conflictCount: 0,
      failedCount: 0,
      lastSyncedAt: new Date('2026-07-26T12:00:00Z'),
    });

    expect(vm.isOnline).toBe(true);
    expect(vm.statusLabel).toBe('Synced');
    expect(vm.statusColor).toBe('emerald');
  });

  it('maps offline state cleanly', () => {
    const vm = SyncViewModelMapper.toViewModel({
      isOnline: false,
      pendingCount: 2,
      conflictCount: 0,
      failedCount: 0,
      lastSyncedAt: null,
    });

    expect(vm.isOnline).toBe(false);
    expect(vm.statusLabel).toBe('Offline');
    expect(vm.statusColor).toBe('gray');
  });

  it('maps pending items state', () => {
    const vm = SyncViewModelMapper.toViewModel({
      isOnline: true,
      pendingCount: 3,
      conflictCount: 0,
      failedCount: 0,
      lastSyncedAt: null,
    });

    expect(vm.statusLabel).toBe('3 Pending');
    expect(vm.statusColor).toBe('amber');
  });
});
