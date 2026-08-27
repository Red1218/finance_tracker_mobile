import { describe, it, expect } from 'vitest';
import { BackupSnapshot } from '../entities/BackupSnapshot';
import { BackupManifest } from '../value-objects/BackupManifest';

describe('BackupSnapshot', () => {
  it('creates valid BackupSnapshot with frozen entity collections', () => {
    const manifest = new BackupManifest({
      manifestVersion: '1.0',
      createdAt: new Date(),
      appVersion: '1.0.0',
      schemaVersion: 1,
      entityCounts: { accounts: 1 },
    });

    const snapshot = new BackupSnapshot({
      manifest,
      accounts: [{ id: 'acc-1' }],
      categories: [{ id: 'cat-1' }],
      transactions: [{ id: 'tx-1' }],
      budgets: [],
      bills: [],
    });

    expect(snapshot.manifest).toBe(manifest);
    expect(snapshot.accounts.length).toBe(1);
    expect(snapshot.categories.length).toBe(1);
    expect(snapshot.transactions.length).toBe(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.accounts)).toBe(true);
  });
});
