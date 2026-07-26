import { describe, it, expect } from 'vitest';
import { Insight } from '../entities/Insight';
import { InsightType, InsightSeverity, InsightSource } from '../value-objects/InsightType';
import { ConfidenceScore } from '../value-objects/ConfidenceScore';
import { InsightDomainError } from '../errors/InsightDomainError';

describe('Insight Aggregate Root', () => {
  const createTestInsight = () => {
    return new Insight({
      id: 'ins-100',
      type: InsightType.ANOMALY_DETECTION,
      severity: InsightSeverity.HIGH,
      source: InsightSource.AI_MODEL,
      title: 'Unusual Dining Spend',
      description: 'Dining expense is 250% higher than your 90-day average.',
      confidenceScore: new ConfidenceScore(0.92),
    });
  };

  it('creates valid Insight instance in non-dismissed state', () => {
    const insight = createTestInsight();
    expect(insight.id).toBe('ins-100');
    expect(insight.type).toBe(InsightType.ANOMALY_DETECTION);
    expect(insight.severity).toBe(InsightSeverity.HIGH);
    expect(insight.isDismissed).toBe(false);
  });

  it('handles dismissal state transition', () => {
    const insight = createTestInsight();
    insight.dismiss();
    expect(insight.isDismissed).toBe(true);
  });

  it('throws InsightDomainError if dismissing an already dismissed insight', () => {
    const insight = createTestInsight();
    insight.dismiss();
    expect(() => insight.dismiss()).toThrow(InsightDomainError);
  });
});
