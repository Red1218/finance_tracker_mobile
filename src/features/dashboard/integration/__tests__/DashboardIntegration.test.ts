import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardBootstrap } from '../DashboardBootstrap';
import { DashboardContainer } from '../DashboardContainer';
import { GlobalEventBus, DashboardIntegrationEvent } from '../DashboardCrossFeatureIntegration';

describe('Dashboard Feature End-to-End Integration', () => {
  beforeEach(async () => {
    await DashboardBootstrap.dispose();
  });

  it('should completely bootstrap and successfully execute a dashboard load', async () => {
    // 1. App Startup Simulation
    const mockEventBus: GlobalEventBus = {
      subscribe: vi.fn().mockReturnValue(vi.fn())
    };

    await DashboardBootstrap.initialize({
      apiBaseUrl: 'http://localhost:3000',
      globalEventBus: mockEventBus
    });

    // 2. Retrieve the facade as the Presentation layer would
    const facade = DashboardContainer.getFacade();
    expect(facade).toBeDefined();

    // 3. Execute the core Use Case (Load Dashboard)
    // Since we're using a RemoteDashboardRepository without a real network mock,
    // this will attempt to fetch and fail, falling back to cache or throwing.
    // However, the resilience policies will catch it.
    // For a strict E2E test, we'd mock the global fetch. Let's do that.
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        activeReportingPeriodId: 'CurrentMonth',
        startDate: new Date('2023-01-01').toISOString(),
        endDate: new Date('2023-01-31').toISOString(),
        budgets: [],
        categories: [],
        transactions: []
      })
    });

    try {
      const snapshot = await facade.loadDashboard({
        userId: 'user-123',
        reportingPeriodId: 'CurrentMonth',
        correlationId: 'test-corr-id'
      });

      // The repository resolves an empty snapshot correctly
      expect(snapshot).toBeDefined();
      expect(snapshot.overallStatus).toBe('Loaded');
      expect(snapshot.activeReportingPeriodLabel).toContain('2023-01-01');
    } finally {
      // Cleanup
      global.fetch = originalFetch;
    }
  });

  it('should propagate cross-feature events to the dashboard facade', async () => {
    let transactionCallback: any;
    const mockEventBus: GlobalEventBus = {
      subscribe: (event: string, callback: any) => {
        if (event === DashboardIntegrationEvent.TransactionCreated) transactionCallback = callback;
        return vi.fn();
      }
    };

    await DashboardBootstrap.initialize({
      apiBaseUrl: 'http://localhost:3000',
      globalEventBus: mockEventBus
    });

    const facade = DashboardContainer.getFacade();
    const refreshSpy = vi.spyOn(facade, 'refreshSection').mockResolvedValue(undefined as any);

    // Simulate external feature event
    expect(transactionCallback).toBeDefined();
    transactionCallback({ transactionId: 'tx-123' });

    // Verify it reached the Dashboard Facade
    expect(refreshSpy).toHaveBeenCalledWith(expect.objectContaining({ sectionType: 'RecentActivity' }));
    expect(refreshSpy).toHaveBeenCalledWith(expect.objectContaining({ sectionType: 'KPI' }));
  });
});
