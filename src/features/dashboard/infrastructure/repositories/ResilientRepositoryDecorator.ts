import { DashboardReadRepository } from '../../application/ports/DashboardReadRepository';
import { DashboardDataSnapshot } from '../../application/models/DashboardDataSnapshot';
import { RetryPolicy } from '../policies/RetryPolicy';
import { CircuitBreakerPolicy } from '../policies/CircuitBreakerPolicy';
import { Logger } from '../../application/ports/Logger';

export class ResilientRepositoryDecorator implements DashboardReadRepository {
  constructor(
    private readonly inner: DashboardReadRepository,
    private readonly retryPolicy: RetryPolicy,
    private readonly circuitBreakerPolicy: CircuitBreakerPolicy,
    private readonly logger: Logger
  ) {}

  async getDashboardData(userId: string, reportingPeriodId?: string): Promise<DashboardDataSnapshot> {
    this.logger.debug('Executing getDashboardData through ResilientRepositoryDecorator', { userId });

    const operation = async () => {
      return await this.retryPolicy.execute(
        () => this.inner.getDashboardData(userId, reportingPeriodId)
      );
    };

    const fallback = async (): Promise<DashboardDataSnapshot> => {
      this.logger.warn('Circuit breaker open or retries exhausted, rethrowing to cache layer', { userId });
      throw new Error('Resilience layer exhausted');
    };

    return await this.circuitBreakerPolicy.execute(operation, fallback);
  }
}
