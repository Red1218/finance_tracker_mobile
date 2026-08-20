import { describe, it, expect, vi } from 'vitest';
import { DashboardCrossFeatureIntegration, DashboardIntegrationEvent, GlobalEventBus, UnsubscribeFunction } from '../DashboardCrossFeatureIntegration';
import { DashboardFacade } from '../../application/facade/DashboardFacade';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';

describe('DashboardCrossFeatureIntegration UUID Regression Tests', () => {
  it('subscribes to CategoryModified event and dispatches refreshSection without throwing ReferenceError', () => {
    const mockFacade = {
      refreshSection: vi.fn(),
      loadDashboard: vi.fn(),
      changeReportingPeriod: vi.fn(),
      executeQuickAction: vi.fn(),
    } as unknown as DashboardFacade;

    const logger = new LoggerAdapter();
    const integration = new DashboardCrossFeatureIntegration(mockFacade, logger);

    const handlers: Record<string, (payload: Record<string, unknown>) => void> = {};
    const mockEventBus: GlobalEventBus = {
      subscribe: (eventType: string, callback: (payload: Record<string, unknown>) => void): UnsubscribeFunction => {
        handlers[eventType] = callback;
        return () => {};
      },
    };

    integration.registerExternalListeners(mockEventBus);

    expect(handlers[DashboardIntegrationEvent.CategoryModified]).toBeDefined();

    // Trigger handler
    handlers[DashboardIntegrationEvent.CategoryModified]({ userId: 'user-999' });

    expect(mockFacade.refreshSection).toHaveBeenCalledWith({
      correlationId: expect.any(String),
      userId: 'user-999',
      sectionType: 'CategoryBreakdown',
    });
  });
});
