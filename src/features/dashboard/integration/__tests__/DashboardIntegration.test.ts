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

    const queryBuilder = {
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      then: function(resolve: any) { resolve({ data: [], error: null }); }
    };

    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(queryBuilder)
      })
    };

    await DashboardBootstrap.initialize({
      supabaseClient: mockSupabase,
      globalEventBus: mockEventBus
    });

    // 2. Retrieve the facade as the Presentation layer would
    const facade = DashboardContainer.getFacade();
    expect(facade).toBeDefined();

    const snapshot = await facade.loadDashboard({
      userId: 'user-123',
      reportingPeriodId: 'CurrentMonth',
      correlationId: 'test-corr-id'
    });

    // The repository resolves an empty snapshot correctly
    expect(snapshot).toBeDefined();
    expect(snapshot.overallStatus).toBe('Loaded');
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
