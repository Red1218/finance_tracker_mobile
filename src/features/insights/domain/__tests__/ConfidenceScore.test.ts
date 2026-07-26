import { describe, it, expect } from 'vitest';
import { ConfidenceScore } from '../value-objects/ConfidenceScore';
import { InsightDomainError } from '../errors/InsightDomainError';

describe('ConfidenceScore Value Object', () => {
  it('creates valid ConfidenceScore instance', () => {
    const score = new ConfidenceScore(0.85);
    expect(score.score).toBe(0.85);
    expect(score.toPercentage()).toBe(85);
  });

  it('rejects scores outside 0.0 to 1.0 range', () => {
    expect(() => new ConfidenceScore(-0.1)).toThrow(InsightDomainError);
    expect(() => new ConfidenceScore(1.1)).toThrow(InsightDomainError);
    expect(() => new ConfidenceScore(NaN)).toThrow(InsightDomainError);
  });
});
