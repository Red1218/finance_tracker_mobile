import { describe, it, expect } from 'vitest';
import { SyncTarget } from '../value-objects/SyncTarget';
import { SyncDomainError } from '../errors/SyncDomainError';

describe('SyncTarget Value Object', () => {
  it('creates valid SyncTarget instance', () => {
    const target = new SyncTarget('TRANSACTION', 'tx-123');
    expect(target.entityType).toBe('TRANSACTION');
    expect(target.entityId).toBe('tx-123');
  });

  it('rejects empty entityId', () => {
    expect(() => new SyncTarget('ACCOUNT', '')).toThrow(SyncDomainError);
    expect(() => new SyncTarget('ACCOUNT', '   ')).toThrow(SyncDomainError);
  });
});
