export interface TelemetryProvider {
  trackMetric(name: string, value: number, properties?: Record<string, unknown>): void;
  trackEvent(name: string, properties?: Record<string, unknown>): void;
  trackException(error: Error, properties?: Record<string, unknown>): void;
  trackDependency(name: string, durationMs: number, success: boolean, properties?: Record<string, unknown>): void;
  startTimer(metricName: string): () => number;
}
