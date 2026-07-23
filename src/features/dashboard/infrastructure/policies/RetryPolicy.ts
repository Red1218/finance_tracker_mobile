import { Logger } from '../../application/ports/Logger';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
}

export class RetryPolicy {
  constructor(
    private readonly config: RetryConfig,
    private readonly logger: Logger
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        // Don't retry if we've hit the limit
        if (attempt >= this.config.maxRetries) {
          this.logger.error(`RetryPolicy exhausted after ${attempt} attempts`, error);
          throw error;
        }

        // Exponential backoff with some jitter
        const delay = this.config.baseDelayMs * Math.pow(2, attempt - 1) + (Math.random() * 100);
        this.logger.warn(`RetryPolicy attempt ${attempt} failed, retrying in ${delay.toFixed(0)}ms`, { error: error.message });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unreachable');
  }
}
