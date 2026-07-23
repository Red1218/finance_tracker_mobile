import { TelemetryProvider } from '../../application/ports/TelemetryProvider';
import { Logger } from '../../application/ports/Logger';

export class TelemetryAdapter implements TelemetryProvider {
  constructor(private readonly logger: Logger) {}

  trackMetric(name: string, value: number, properties?: Record<string, unknown>): void {
    this.logger.info(`Metric: ${name}`, { metricValue: value, ...properties });
    // In real implementation, send to Datadog / AppInsights
  }

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    this.logger.info(`Telemetry Event: ${name}`, properties);
  }

  trackException(error: Error, properties?: Record<string, unknown>): void {
    this.logger.error('Telemetry Exception', error, properties);
  }

  trackDependency(name: string, durationMs: number, success: boolean, properties?: Record<string, unknown>): void {
    this.logger.info(`Dependency: ${name}`, { durationMs, success, ...properties });
  }

  startTimer(metricName: string): () => number {
    const start = performance.now();
    return () => {
      const durationMs = performance.now() - start;
      return durationMs;
    };
  }
}
