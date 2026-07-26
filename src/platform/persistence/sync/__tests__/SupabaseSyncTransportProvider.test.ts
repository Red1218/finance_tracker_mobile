import { describe, it, expect, vi } from 'vitest';
import { SupabaseSyncTransportProvider } from '../SupabaseSyncTransportProvider';
import { SyncOperation, SyncTarget } from '../../../../features/sync/domain';

describe('SupabaseSyncTransportProvider', () => {
  const createMockClient = (error: any = null) => {
    const chain: any = {
      upsert: vi.fn().mockResolvedValue({ error }),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error }),
    };
    return {
      from: vi.fn().mockReturnValue(chain),
    } as any;
  };

  it('pushes operation successfully using upsert', async () => {
    const client = createMockClient(null);
    const provider = new SupabaseSyncTransportProvider(client);

    const target = new SyncTarget('ACCOUNT', 'acc-123');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { name: 'Checking' },
    });

    const result = await provider.pushOperation(op);

    expect(result.success).toBe(true);
  });

  it('detects conflict error codes (23505)', async () => {
    const client = createMockClient({ code: '23505', message: 'Key unique constraint error' });
    const provider = new SupabaseSyncTransportProvider(client);

    const target = new SyncTarget('CATEGORY', 'cat-1');
    const op = new SyncOperation({
      operationType: 'CREATE',
      target,
      payloadSnapshot: { name: 'Food' },
    });

    const result = await provider.pushOperation(op);

    expect(result.success).toBe(false);
    expect(result.conflict).toBe(true);
  });
});
