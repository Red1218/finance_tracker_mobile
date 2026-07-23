import { DashboardFacade } from '../application/facade/DashboardFacade';
import { generateUUID } from '../../../core/utils/uuid';
import { LoggerAdapter } from '../infrastructure/services/LoggerAdapter';

/**
 * Known events that the Dashboard can react to.
 */
export enum DashboardIntegrationEvent {
  TransactionCreated = 'TransactionCreatedEvent',
  BudgetUpdated = 'BudgetUpdatedEvent',
  CategoryModified = 'CategoryModifiedEvent',
}

export type UnsubscribeFunction = () => void;

/**
 * Interface representing a generic application-wide event bus.
 */
export interface GlobalEventBus {
  subscribe(eventType: string, callback: (payload: any) => void): UnsubscribeFunction;
}

export class DashboardCrossFeatureIntegration {
  constructor(
    private readonly facade: DashboardFacade,
    private readonly logger: LoggerAdapter
  ) {}

  /**
   * Wires the Dashboard feature to the host application's global event bus.
   * @returns Array of unsubscribe functions to cleanly detach listeners.
   */
  registerExternalListeners(eventBus: GlobalEventBus): UnsubscribeFunction[] {
    this.logger.info('[DashboardCrossFeatureIntegration] Registering cross-feature listeners');
    const subscriptions: UnsubscribeFunction[] = [];

    // Note: In the future, if multiple events arrive close together, 
    // a refresh coordinator could coalesce updates into a single cycle.

    subscriptions.push(
      eventBus.subscribe(DashboardIntegrationEvent.TransactionCreated, (payload) => {
        this.logger.info(`[DashboardCrossFeatureIntegration] Received ${DashboardIntegrationEvent.TransactionCreated}`, payload);
        const userId = payload?.userId || payload?.dashboardId || 'unknown';
        this.facade.refreshSection({ correlationId: generateUUID(), userId, sectionType: 'RecentActivity' });
        this.facade.refreshSection({ correlationId: generateUUID(), userId, sectionType: 'KPI' });
      })
    );

    subscriptions.push(
      eventBus.subscribe(DashboardIntegrationEvent.BudgetUpdated, (payload) => {
        this.logger.info(`[DashboardCrossFeatureIntegration] Received ${DashboardIntegrationEvent.BudgetUpdated}`, payload);
        const userId = payload?.userId || payload?.dashboardId || 'unknown';
        this.facade.refreshSection({ correlationId: generateUUID(), userId, sectionType: 'BudgetHealth' });
      })
    );

    subscriptions.push(
      eventBus.subscribe(DashboardIntegrationEvent.CategoryModified, (payload) => {
        this.logger.info(`[DashboardCrossFeatureIntegration] Received ${DashboardIntegrationEvent.CategoryModified}`, payload);
        const userId = payload?.userId || payload?.dashboardId || 'unknown';
        this.facade.refreshSection({ correlationId: crypto.randomUUID(), userId, sectionType: 'CategoryBreakdown' });
      })
    );

    return subscriptions;
  }
}
