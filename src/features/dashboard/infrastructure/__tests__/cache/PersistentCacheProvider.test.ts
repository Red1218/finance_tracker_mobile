import { describe, it, expect } from 'vitest';
import { FakePersistentCacheProvider } from '../../cache/PersistentCacheProvider';

describe('PersistentCacheProvider (Fake)', () => {
  it('should store and retrieve serializable objects', async () => {
    const cache = new FakePersistentCacheProvider();
    await cache.set('obj', { nested: { count: 1 } });
    
    const obj = await cache.get<{nested: {count: number}}>('obj');
    expect(obj).toEqual({ nested: { count: 1 } });
  });

  it('should simulate boundary by breaking reference identity', async () => {
    const cache = new FakePersistentCacheProvider();
    const original = { a: 1 };
    await cache.set('ref', original);
    
    const retrieved = await cache.get<typeof original>('ref');
    expect(retrieved).toEqual(original);
    expect(retrieved).not.toBe(original);
  });

  it('should respect TTL', async () => {
    const cache = new FakePersistentCacheProvider();
    // Negative TTL to simulate expiry
    await cache.set('exp', 'val', -10);
    
    expect(await cache.get('exp')).toBeNull();
  });
});
