import { describe, it, expect, vi } from 'vitest';
import { DashboardCrossFeatureIntegration, GlobalEventBus, DashboardIntegrationEvent } from '../DashboardCrossFeatureIntegration';
import { DashboardFacade } from '../../application/facade/DashboardFacade';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';

describe('DashboardCrossFeatureIntegration', () => {
  it('should trigger facade refresh when cross-feature events occur', () => {
    const mockFacade = {
      refreshSection: vi.fn(),
    } as unknown as DashboardFacade;

    const mockLogger = {
      info: vi.fn(),
    } as unknown as LoggerAdapter;

    let transactionCallback: any;
    let budgetCallback: any;
    
    const mockEventBus: GlobalEventBus = {
      subscribe: (event: string, callback: any) => {
        if (event === DashboardIntegrationEvent.TransactionCreated) transactionCallback = callback;
        if (event === DashboardIntegrationEvent.BudgetUpdated) budgetCallback = callback;
        return vi.fn();
      }
    };

    const integration = new DashboardCrossFeatureIntegration(mockFacade, mockLogger);
    integration.registerExternalListeners(mockEventBus);

    // Simulate TransactionCreatedEvent
    transactionCallback({ id: 1 });
    expect(mockFacade.refreshSection).toHaveBeenCalledWith(expect.objectContaining({ sectionType: 'RecentActivity' }));
    expect(mockFacade.refreshSection).toHaveBeenCalledWith(expect.objectContaining({ sectionType: 'KPI' }));

    // Simulate BudgetUpdatedEvent
    budgetCallback({ id: 2 });
    expect(mockFacade.refreshSection).toHaveBeenCalledWith(expect.objectContaining({ sectionType: 'BudgetHealth' }));
  });
});
