import { describe, it, expect, vi } from 'vitest';
import { TelemetryAdapter } from '../../services/TelemetryAdapter';
import { Logger } from '../../../application/ports/Logger';

describe('TelemetryAdapter', () => {
  it('should track metrics to logger', () => {
    const logger: Logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    const telemetry = new TelemetryAdapter(logger);
    
    telemetry.trackMetric('LoadTime', 150);
    expect(logger.info).toHaveBeenCalledWith('Metric: LoadTime', expect.objectContaining({ metricValue: 150 }));
  });
});
