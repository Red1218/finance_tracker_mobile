import { DependencyRegistry, DashboardConfiguration } from './DependencyRegistry';
import { DashboardFacade } from '../application/facade/DashboardFacade';

export class DashboardContainer {
  private static registry: DependencyRegistry = new DependencyRegistry();

  /**
   * Initializes the Dashboard dependency graph.
   */
  static initialize(config: DashboardConfiguration): DashboardFacade {
    return this.registry.bootstrap(config);
  }

  /**
   * Returns the resolved Facade for the Dashboard feature.
   */
  static getFacade(): DashboardFacade {
    return this.registry.getFacade();
  }
}
