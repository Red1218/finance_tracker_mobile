import { Logger } from '../../application/ports/Logger';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreakerPolicy {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private nextAttemptAt = 0;

  constructor(
    private readonly config: CircuitBreakerConfig,
    private readonly logger: Logger
  ) {}

  async execute<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptAt) {
        this.state = 'HALF_OPEN';
        this.logger.info('Circuit breaker entering HALF_OPEN state');
      } else {
        return fallback();
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.logger.info('Circuit breaker reset to CLOSED state');
      }

      return result;
    } catch (error: any) {
      this.failureCount++;
      
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttemptAt = Date.now() + this.config.resetTimeoutMs;
        this.logger.warn(`Circuit breaker tripped to OPEN state. Reset in ${this.config.resetTimeoutMs}ms`);
      }

      return fallback();
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
