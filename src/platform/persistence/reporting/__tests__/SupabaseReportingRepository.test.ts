import { describe, it, expect, vi } from 'vitest';
import { SupabaseReportingRepository } from '../SupabaseReportingRepository';
import { ReportingPeriod } from '../../../../features/reporting/domain';

describe('SupabaseReportingRepository', () => {
  const createMockClient = (data: any = [], error: any = null) => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data, error }),
    };
    return {
      from: vi.fn().mockReturnValue(chain),
    } as any;
  };

  it('fetches dashboard summary filtering voided_at null', async () => {
    const mockData = [
      { type: 'INCOME', amount: 50000 },
      { type: 'EXPENSE', amount: 20000 },
    ];
    const client = createMockClient(mockData);
    const repo = new SupabaseReportingRepository(client);

    const result = await repo.getDashboardSummary(ReportingPeriod.MONTH);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalIncome).toBe(50000);
      expect(result.data.totalExpenses).toBe(20000);
      expect(result.data.netCashFlow).toBe(30000);
      expect(result.data.savingsRate).toBe(60);
    }
  });

  it('handles database error gracefully', async () => {
    const client = createMockClient(null, { message: 'Connection failure' });
    const repo = new SupabaseReportingRepository(client);

    const result = await repo.getDashboardSummary(ReportingPeriod.MONTH);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('UNKNOWN_PERSISTENCE_ERROR');
    }
  });
});
