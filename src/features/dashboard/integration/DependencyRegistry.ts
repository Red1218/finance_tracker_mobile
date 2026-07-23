import { LoggerAdapter } from '../infrastructure/services/LoggerAdapter';
import { TelemetryAdapter } from '../infrastructure/services/TelemetryAdapter';
import { InMemoryCacheProvider } from '../infrastructure/cache/InMemoryCacheProvider';
import { FakePersistentCacheProvider } from '../infrastructure/cache/PersistentCacheProvider';
import { CacheCoordinator } from '../infrastructure/cache/CacheCoordinator';
import { RetryPolicy } from '../infrastructure/policies/RetryPolicy';
import { CircuitBreakerPolicy } from '../infrastructure/policies/CircuitBreakerPolicy';
import { SupabaseDashboardRepository } from '../infrastructure/repositories/SupabaseDashboardRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { ResilientRepositoryDecorator } from '../infrastructure/repositories/ResilientRepositoryDecorator';
import { CachedRepositoryDecorator } from '../infrastructure/repositories/CachedRepositoryDecorator';
import { EventDispatcherAdapter } from '../infrastructure/adapters/EventDispatcherAdapter';
import { QuickActionGatewayAdapter } from '../infrastructure/adapters/QuickActionGatewayAdapter';

import { FinancialSummaryService } from '../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../domain/services/RecentActivityService';

import { DashboardRefreshService } from '../application/services/DashboardRefreshService';
import { LoadDashboardUseCase } from '../application/use-cases/LoadDashboardUseCase';
import { ChangeReportingPeriodUseCase } from '../application/use-cases/ChangeReportingPeriodUseCase';
import { RefreshSectionUseCase } from '../application/use-cases/RefreshSectionUseCase';
import { ExecuteQuickActionUseCase } from '../application/use-cases/ExecuteQuickActionUseCase';
import { DashboardFacade } from '../application/facade/DashboardFacade';

export interface DashboardConfiguration {
  apiBaseUrl?: string;
  supabaseClient?: SupabaseClient;
}

export class DependencyRegistry {
  private facade: DashboardFacade | null = null;
  private container: any = {}; // Simple container to hold singletons

  constructor() {}

  bootstrap(config: DashboardConfiguration): DashboardFacade {
    if (this.facade) {
      return this.facade;
    }

    // 1. Infrastructure - Services
    const logger = new LoggerAdapter();
    const telemetry = new TelemetryAdapter(logger);

    // 2. Infrastructure - Caching
    const l1Cache = new InMemoryCacheProvider();
    const l2Cache = new FakePersistentCacheProvider(); // The Fake for now
    const cacheCoordinator = new CacheCoordinator(l1Cache, l2Cache, logger);

    // 3. Infrastructure - Policies
    const retryPolicy = new RetryPolicy({ maxRetries: 3, baseDelayMs: 1000 }, logger);
    const cbPolicy = new CircuitBreakerPolicy({ failureThreshold: 5, resetTimeoutMs: 30000 }, logger);

    // 4. Infrastructure - Repository Decorator Chain
    const supabaseRepo = new SupabaseDashboardRepository(config?.supabaseClient, logger, telemetry);
    const resilientRepo = new ResilientRepositoryDecorator(supabaseRepo, retryPolicy, cbPolicy, logger);
    const dashboardRepository = new CachedRepositoryDecorator(resilientRepo, cacheCoordinator, logger, 900);

    // 5. Domain Services
    const financialSummaryService = new FinancialSummaryService();
    const budgetHealthService = new BudgetHealthService();
    const categoryBreakdownService = new CategoryBreakdownService();
    const recentActivityService = new RecentActivityService();

    // 6. Application - Use Cases (Part 1: Needed by services)
    const refreshSectionUseCase = new RefreshSectionUseCase(
      dashboardRepository,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService,
      logger
    );

    // 7. Application Services
    const dashboardRefreshService = new DashboardRefreshService(refreshSectionUseCase, logger);
    
    // 8. Infrastructure - Adapters (dependent on App Services)
    const eventDispatcher = new EventDispatcherAdapter(dashboardRefreshService, logger);
    const quickActionGateway = new QuickActionGatewayAdapter(config?.apiBaseUrl || 'mock://', logger, telemetry);

    // 9. Application - Use Cases (Part 2)
    const loadDashboardUseCase = new LoadDashboardUseCase(
      dashboardRepository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const changeReportingPeriodUseCase = new ChangeReportingPeriodUseCase(
      loadDashboardUseCase,
      eventDispatcher,
      logger
    );

    const executeQuickActionUseCase = new ExecuteQuickActionUseCase(
      quickActionGateway,
      logger
    );


    // 9. Application - Facade
    this.facade = new DashboardFacade(
      loadDashboardUseCase,
      changeReportingPeriodUseCase,
      refreshSectionUseCase,
      executeQuickActionUseCase
    );

    // Save references for testing / teardown if needed
    this.container = {
      logger,
      telemetry,
      cacheCoordinator,
      dashboardRepository,
      eventDispatcher,
      facade: this.facade
    };

    return this.facade;
  }

  getFacade(): DashboardFacade {
    if (!this.facade) {
      throw new Error('Dashboard Dependencies have not been bootstrapped. Call bootstrap() first.');
    }
    return this.facade;
  }
}
