import { CacheProvider } from '../../application/ports/CacheProvider';
import { PersistentCacheProvider } from './PersistentCacheProvider';
import { Logger } from '../../application/ports/Logger';

export class CacheCoordinator implements CacheProvider {
  constructor(
    private readonly l1Cache: CacheProvider,
    private readonly l2Cache: PersistentCacheProvider,
    private readonly logger: Logger
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Try L1 (fastest)
    const l1Result = await this.l1Cache.get<T>(key);
    if (l1Result !== null) {
      this.logger.debug(`L1 Cache hit for key: ${key}`);
      return l1Result;
    }

    // Try L2 (persistent)
    const l2Result = await this.l2Cache.get<T>(key);
    if (l2Result !== null) {
      this.logger.debug(`L2 Cache hit for key: ${key}. Promoting to L1.`);
      // Promote back to L1
      await this.l1Cache.set(key, l2Result);
      return l2Result;
    }

    this.logger.debug(`Cache miss for key: ${key}`);
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Write-through to both caches concurrently
    await Promise.all([
      this.l1Cache.set(key, value, ttlSeconds),
      this.l2Cache.set(key, value, ttlSeconds)
    ]);
    this.logger.debug(`Cache updated for key: ${key}`);
  }

  async invalidate(key: string): Promise<void> {
    await Promise.all([
      this.l1Cache.invalidate(key),
      this.l2Cache.invalidate(key)
    ]);
    this.logger.info(`Cache invalidated for key: ${key}`);
  }

  async invalidateAll(): Promise<void> {
    await Promise.all([
      this.l1Cache.invalidateAll(),
      this.l2Cache.invalidateAll()
    ]);
    this.logger.info('Entire cache invalidated');
  }

  async refresh(key: string): Promise<void> {
    // Force eviction from L1 so next request falls back to L2, or evicts both
    await this.invalidate(key);
  }
}
