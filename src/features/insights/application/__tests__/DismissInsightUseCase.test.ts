import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DismissInsightUseCase } from '../use-cases/DismissInsightUseCase';
import { Insight, InsightType, InsightSeverity, InsightSource, ConfidenceScore, InsightDomainError } from '../../domain';

describe('DismissInsightUseCase', () => {
  let mockInsightsRepo: any;
  let useCase: DismissInsightUseCase;

  beforeEach(() => {
    mockInsightsRepo = {
      getInsightById: vi.fn(),
      updateInsight: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new DismissInsightUseCase(mockInsightsRepo);
  });

  it('dismisses active insight and persists update', async () => {
    const insight = new Insight({
      id: 'ins-50',
      type: InsightType.ANOMALY_DETECTION,
      severity: InsightSeverity.MEDIUM,
      source: InsightSource.RULE_ENGINE,
      title: 'Subscription Spike',
      description: 'Recurring payments increased by 20%.',
      confidenceScore: new ConfidenceScore(0.8),
    });

    mockInsightsRepo.getInsightById.mockResolvedValue(insight);

    const success = await useCase.execute('ins-50');

    expect(success).toBe(true);
    expect(insight.isDismissed).toBe(true);
    expect(mockInsightsRepo.updateInsight).toHaveBeenCalledWith(insight);
  });

  it('throws InsightDomainError when insight not found', async () => {
    mockInsightsRepo.getInsightById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(InsightDomainError);
  });
});
