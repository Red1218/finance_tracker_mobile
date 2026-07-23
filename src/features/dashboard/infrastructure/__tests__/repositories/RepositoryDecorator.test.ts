import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedRepositoryDecorator } from '../../repositories/CachedRepositoryDecorator';
import { DashboardReadRepository } from '../../../application/ports/DashboardReadRepository';
import { CacheProvider } from '../../../application/ports/CacheProvider';
import { Logger } from '../../../application/ports/Logger';
import { DashboardDataSnapshot } from '../../../application/models/DashboardDataSnapshot';

describe('RepositoryDecorators', () => {
  let innerRepo: DashboardReadRepository;
  let cache: CacheProvider;
  let logger: Logger;
  let snapshot: DashboardDataSnapshot;

  beforeEach(() => {
    innerRepo = { getDashboardData: vi.fn() };
    cache = { get: vi.fn(), set: vi.fn(), invalidate: vi.fn(), invalidateAll: vi.fn(), refresh: vi.fn() };
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    
    snapshot = {
      activeReportingPeriodId: 'CURRENT',
      startDate: new Date(),
      endDate: new Date(),
      budgets: [],
      categories: [],
      transactions: []
    };
  });

  describe('CachedRepositoryDecorator', () => {
    it('should return cached data if available', async () => {
      (cache.get as any).mockResolvedValue(snapshot);
      const decorator = new CachedRepositoryDecorator(innerRepo, cache, logger);
      
      const result = await decorator.getDashboardData('user1', 'period1');
      expect(result).toStrictEqual(snapshot);
      expect(innerRepo.getDashboardData).not.toHaveBeenCalled();
    });

    it('should fetch from inner and set cache if cache miss', async () => {
      (cache.get as any).mockResolvedValue(null);
      (cache.set as any).mockResolvedValue(undefined);
      (innerRepo.getDashboardData as any).mockResolvedValue(snapshot);

      const decorator = new CachedRepositoryDecorator(innerRepo, cache, logger);
      
      const result = await decorator.getDashboardData('user1', 'period1');
      expect(result).toBe(snapshot);
      expect(innerRepo.getDashboardData).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith('dashboard:user1:period1', snapshot, 900);
    });

    it('should throw if both cache miss and inner fails', async () => {
      (cache.get as any).mockResolvedValue(null);
      (innerRepo.getDashboardData as any).mockRejectedValue(new Error('Network error'));

      const decorator = new CachedRepositoryDecorator(innerRepo, cache, logger);
      
      await expect(decorator.getDashboardData('user1')).rejects.toThrow('Network error');
    });
  });
});
