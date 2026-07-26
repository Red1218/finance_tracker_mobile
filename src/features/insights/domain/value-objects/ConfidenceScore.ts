import { InsightDomainError } from '../errors/InsightDomainError';

export class ConfidenceScore {
  public readonly score: number;

  constructor(score: number) {
    if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 1) {
      throw new InsightDomainError(
        'INVALID_CONFIDENCE_SCORE',
        'Confidence score must be a valid number between 0.0 and 1.0.'
      );
    }

    this.score = Math.round(score * 100) / 100;
    Object.freeze(this);
  }

  public toPercentage(): number {
    return Math.round(this.score * 100);
  }
}
