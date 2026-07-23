import { DashboardReadRepository } from '../../application/ports/DashboardReadRepository';
import { DashboardDataSnapshot } from '../../application/models/DashboardDataSnapshot';
import { CacheProvider } from '../../application/ports/CacheProvider';
import { Logger } from '../../application/ports/Logger';

export class CachedRepositoryDecorator implements DashboardReadRepository {
  constructor(
    private readonly inner: DashboardReadRepository,
    private readonly cache: CacheProvider,
    private readonly logger: Logger,
    private readonly cacheTtlSeconds: number = 900 // 15 mins
  ) {}

  async getDashboardData(userId: string, reportingPeriodId?: string): Promise<DashboardDataSnapshot> {
    const cacheKey = `dashboard:${userId}:${reportingPeriodId || 'default'}`;

    // 1. Try Read-Through
    try {
      const cached = await this.cache.get<DashboardDataSnapshot>(cacheKey);
      if (cached) {
        // Date objects are revived — create a new snapshot with revived dates.
        const revived: DashboardDataSnapshot = {
          ...cached,
          startDate: new Date(cached.startDate),
          endDate: new Date(cached.endDate),
          transactions: cached.transactions.map(t => ({ ...t, occurredAt: new Date(t.occurredAt) })),
        };
        this.logger.debug('Cache hit for DashboardDataSnapshot', { cacheKey });
        return revived;
      }
    } catch (err) {
      this.logger.warn('Failed to read from cache, bypassing', { cacheKey });
    }

    // 2. Network Fetch
    try {
      const freshData = await this.inner.getDashboardData(userId, reportingPeriodId);
      
      // 3. Update Cache (Write-Through)
      this.cache.set(cacheKey, freshData, this.cacheTtlSeconds).catch(err => {
        this.logger.warn('Failed to write to cache', { cacheKey });
      });

      return freshData;
    } catch (error: any) {
      // 4. Stale Cache Fallback
      // If we had a stale cache ignoring TTL, we would implement it here.
      // But since cache.get() respects TTL, if we got here, cache is either empty or expired.
      // In a real implementation with explicit stale support, we'd fetch skipping TTL.
      this.logger.error('Failed to fetch from inner repository', error, { cacheKey });
      throw error; // Let application layer handle the error state
    }
  }
}
