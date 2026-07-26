import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryInsightsReadRepository } from '../InMemoryInsightsReadRepository';
import { Insight, InsightType, InsightSeverity, InsightSource, ConfidenceScore } from '../../../../features/insights/domain';

describe('InMemoryInsightsReadRepository', () => {
  let repo: InMemoryInsightsReadRepository;

  beforeEach(() => {
    repo = new InMemoryInsightsReadRepository();
  });

  it('saves, retrieves, and updates insight aggregates', async () => {
    const insight = new Insight({
      id: 'ins-test-1',
      type: InsightType.SPENDING_PATTERN,
      severity: InsightSeverity.MEDIUM,
      source: InsightSource.RULE_ENGINE,
      title: 'Dining Out Habit',
      description: 'Dining spend is increasing.',
      confidenceScore: new ConfidenceScore(0.88),
    });

    await repo.saveInsight(insight);
    const retrieved = await repo.getInsightById('ins-test-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Dining Out Habit');

    insight.dismiss();
    await repo.updateInsight(insight);

    const updated = await repo.getInsightById('ins-test-1');
    expect(updated?.isDismissed).toBe(true);
  });
});
