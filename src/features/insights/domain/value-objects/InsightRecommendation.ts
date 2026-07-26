import { InsightDomainError } from '../errors/InsightDomainError';

export class InsightRecommendation {
  public readonly text: string;
  public readonly actionUrl?: string;

  constructor(text: string, actionUrl?: string) {
    if (!text || text.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Recommendation text cannot be empty.');
    }

    this.text = text.trim();
    this.actionUrl = actionUrl?.trim();

    Object.freeze(this);
  }
}
