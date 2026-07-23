import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardBootstrap } from '../DashboardBootstrap';
import { DashboardContainer } from '../DashboardContainer';
import { GlobalEventBus, DashboardIntegrationEvent } from '../DashboardCrossFeatureIntegration';

describe('DashboardBootstrap', () => {
  beforeEach(async () => {
    // Ensure we start from a clean slate for each test
    await DashboardBootstrap.dispose();
  });

  it('should initialize idempotently', async () => {
    const initializeSpy = vi.spyOn(DashboardContainer, 'initialize');
    
    const config = { apiBaseUrl: 'http://localhost' };
    
    // First initialization
    await DashboardBootstrap.initialize(config);
    expect(initializeSpy).toHaveBeenCalledTimes(1);

    // Second initialization should be ignored
    await DashboardBootstrap.initialize(config);
    expect(initializeSpy).toHaveBeenCalledTimes(1);
  });

  it('should register cross-feature events if event bus is provided', async () => {
    const mockUnsubscribe = vi.fn();
    const mockEventBus: GlobalEventBus = {
      subscribe: vi.fn().mockReturnValue(mockUnsubscribe)
    };

    await DashboardBootstrap.initialize({
      apiBaseUrl: 'http://localhost',
      globalEventBus: mockEventBus
    });

    expect(mockEventBus.subscribe).toHaveBeenCalledWith(DashboardIntegrationEvent.TransactionCreated, expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith(DashboardIntegrationEvent.BudgetUpdated, expect.any(Function));
    expect(mockEventBus.subscribe).toHaveBeenCalledWith(DashboardIntegrationEvent.CategoryModified, expect.any(Function));
  });

  it('should clean up subscriptions on dispose', async () => {
    const mockUnsubscribe = vi.fn();
    const mockEventBus: GlobalEventBus = {
      subscribe: vi.fn().mockReturnValue(mockUnsubscribe)
    };

    await DashboardBootstrap.initialize({
      apiBaseUrl: 'http://localhost',
      globalEventBus: mockEventBus
    });

    await DashboardBootstrap.dispose();

    // Since we subscribed to 3 events, we should have called unsubscribe 3 times
    expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
  });
});
