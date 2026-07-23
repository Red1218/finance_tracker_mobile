import { DashboardContainer } from './DashboardContainer';
import { DashboardConfiguration } from './DependencyRegistry';
import { generateUUID } from '../../../core/utils/uuid';
import { LoggerAdapter } from '../infrastructure/services/LoggerAdapter';
import { GlobalEventBus, DashboardCrossFeatureIntegration, UnsubscribeFunction } from './DashboardCrossFeatureIntegration';

export interface DashboardBootstrapOptions extends DashboardConfiguration {
  globalEventBus?: GlobalEventBus;
}

export class DashboardBootstrap {
  private static isInitialized = false;
  private static logger = new LoggerAdapter();
  private static crossFeatureIntegration: DashboardCrossFeatureIntegration | null = null;
  private static subscriptions: UnsubscribeFunction[] = [];

  /**
   * Initializes the Dashboard feature.
   * This method is idempotent. Repeated calls will return immediately.
   */
  static async initialize(options: DashboardBootstrapOptions): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const correlationId = generateUUID();

    try {
      // 1. Dependency Initialization
      const facade = DashboardContainer.initialize(options);
      
      this.logger.info(`[DashboardBootstrap] Initializing Dashboard feature`, { correlationId });

      // 2. Cross-Feature Integration Wiring
      if (options.globalEventBus) {
        this.crossFeatureIntegration = new DashboardCrossFeatureIntegration(facade, this.logger);
        this.subscriptions = this.crossFeatureIntegration.registerExternalListeners(options.globalEventBus);
      }
      
      // 3. Cache Warm-up (Optional)
      
      this.isInitialized = true;
      this.logger.info(`[DashboardBootstrap] Initialization complete`, { correlationId });
    } catch (error: any) {
      this.logger.error(`[DashboardBootstrap] Initialization failed`, error, { correlationId });
      throw error;
    }
  }

  /**
   * Graceful shutdown hooks.
   * Clears timers, subscriptions, or cached instances.
   */
  static async dispose(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    
    // Clear subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.crossFeatureIntegration = null;

    this.isInitialized = false;
    this.logger.info(`[DashboardBootstrap] Disposed Dashboard feature`);
  }
}
