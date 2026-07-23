import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheCoordinator } from '../../cache/CacheCoordinator';
import { InMemoryCacheProvider } from '../../cache/InMemoryCacheProvider';
import { FakePersistentCacheProvider } from '../../cache/PersistentCacheProvider';
import { Logger } from '../../../application/ports/Logger';

describe('CacheCoordinator', () => {
  let l1: InMemoryCacheProvider;
  let l2: FakePersistentCacheProvider;
  let logger: Logger;
  let coordinator: CacheCoordinator;

  beforeEach(() => {
    l1 = new InMemoryCacheProvider();
    l2 = new FakePersistentCacheProvider();
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    coordinator = new CacheCoordinator(l1, l2, logger);
  });

  it('should write to both caches', async () => {
    await coordinator.set('key1', 'value1');
    expect(await l1.get('key1')).toBe('value1');
    expect(await l2.get('key1')).toBe('value1');
  });

  it('should read from L1 if available', async () => {
    await l1.set('key1', 'value1');
    const getSpy = vi.spyOn(l2, 'get');
    
    const val = await coordinator.get('key1');
    expect(val).toBe('value1');
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('should fallback to L2 and promote to L1 if missing in L1', async () => {
    await l2.set('key1', 'value1');
    const val = await coordinator.get('key1');
    
    expect(val).toBe('value1');
    expect(await l1.get('key1')).toBe('value1');
  });

  it('should invalidate in both caches', async () => {
    await coordinator.set('key1', 'value1');
    await coordinator.invalidate('key1');
    
    expect(await l1.get('key1')).toBeNull();
    expect(await l2.get('key1')).toBeNull();
  });

  it('should invalidate all in both caches', async () => {
    await coordinator.set('k1', 'v1');
    await coordinator.set('k2', 'v2');
    
    await coordinator.invalidateAll();
    
    expect(await l1.get('k1')).toBeNull();
    expect(await l2.get('k2')).toBeNull();
  });
});
