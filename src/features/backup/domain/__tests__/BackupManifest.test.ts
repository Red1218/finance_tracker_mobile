import { describe, it, expect } from 'vitest';
import { BackupManifest } from '../value-objects/BackupManifest';

describe('BackupManifest', () => {
  it('creates valid BackupManifest with frozen properties', () => {
    const now = new Date();
    const manifest = new BackupManifest({
      manifestVersion: '1.0',
      createdAt: now,
      appVersion: '1.0.0',
      schemaVersion: 1,
      entityCounts: { accounts: 2, transactions: 5 },
    });

    expect(manifest.manifestVersion).toBe('1.0');
    expect(manifest.appVersion).toBe('1.0.0');
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.entityCounts).toEqual({ accounts: 2, transactions: 5 });
    expect(Object.isFrozen(manifest)).toBe(true);
  });

  it('throws error if manifestVersion is empty', () => {
    expect(() => new BackupManifest({
      manifestVersion: '',
      createdAt: new Date(),
      appVersion: '1.0.0',
      schemaVersion: 1,
      entityCounts: {},
    })).toThrow('BackupManifest version is required.');
  });
});
