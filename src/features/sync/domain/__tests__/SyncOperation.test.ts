import { describe, it, expect } from 'vitest';
import { SyncOperation } from '../value-objects/SyncOperation';
import { SyncTarget } from '../value-objects/SyncTarget';
import { SyncDomainError } from '../errors/SyncDomainError';

describe('SyncOperation Value Object', () => {
  it('creates valid SyncOperation instance with correlationId', () => {
    const target = new SyncTarget('BUDGET', 'bud-999');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { amount: 5000 },
      correlationId: 'corr-xyz-123',
    });

    expect(op.operationType).toBe('CREATE');
    expect(op.target.entityId).toBe('bud-999');
    expect(op.payloadSnapshot.amount).toBe(5000);
    expect(op.correlationId).toBe('corr-xyz-123');
  });

  it('autogenerates correlationId if omitted', () => {
    const target = new SyncTarget('ACCOUNT', 'acc-1');
    const op = new SyncOperation({
      operationType: 'UPDATE',
      target,
      payloadSnapshot: { name: 'Main Checking' },
    });

    expect(op.correlationId).toBeDefined();
    expect(op.correlationId).toContain('sync-corr-');
  });

  it('rejects invalid payloadSnapshot', () => {
    const target = new SyncTarget('CATEGORY', 'cat-1');
    expect(
      () =>
        new SyncOperation({
          operationType: 'DELETE',
          target,
          payloadSnapshot: null as any,
        })
    ).toThrow(SyncDomainError);
  });
});
