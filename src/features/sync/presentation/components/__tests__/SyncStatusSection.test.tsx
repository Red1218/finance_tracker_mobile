import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { SyncStatusSection } from '../SyncStatusSection';

describe('SyncStatusSection', () => {
  it('renders online connection status and sync button', () => {
    const viewModel = {
      isOnline: true,
      syncStatus: 'IDLE' as const,
      pendingMutationCount: 2,
      lastSyncTimestamp: new Date(),
      errorMessage: null,
    };

    const node = SyncStatusSection({
      viewModel,
      onManualSyncPress: vi.fn(),
    });

    expect(React.isValidElement(node)).toBe(true);
  });
});
