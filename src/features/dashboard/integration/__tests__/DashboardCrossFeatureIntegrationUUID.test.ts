import { describe, it, expect, vi } from 'vitest';
import { DashboardCrossFeatureIntegration, DashboardIntegrationEvent } from '../DashboardCrossFeatureIntegration';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';

describe('DashboardCrossFeatureIntegration UUID Regression Tests', () => {
  it('subscribes to CategoryModified event and dispatches refreshSection without throwing ReferenceError', () => {
    const mockFacade = {
      refreshSection: vi.fn(),
    } as any;
    const logger = new LoggerAdapter();

    const integration = new DashboardCrossFeatureIntegration(mockFacade, logger);

    const handlers: Record<string, Function> = {};
    const mockEventBus = {
      subscribe: vi.fn((eventType: string, callback: Function) => {
        handlers[eventType] = callback;
        return () => {};
      }),
    };

    integration.registerExternalListeners(mockEventBus as any);

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
