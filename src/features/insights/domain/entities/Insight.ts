import { InsightType, InsightSeverity, InsightSource } from '../value-objects/InsightType';
import { ConfidenceScore } from '../value-objects/ConfidenceScore';
import { InsightRecommendation } from '../value-objects/InsightRecommendation';
import { InsightDomainError } from '../errors/InsightDomainError';

export interface InsightProps {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  source: InsightSource;
  title: string;
  description: string;
  recommendation?: InsightRecommendation | null;
  confidenceScore: ConfidenceScore;
  generatedAt?: Date;
  isDismissed?: boolean;
}

export class Insight {
  public readonly id: string;
  public readonly type: InsightType;
  public readonly severity: InsightSeverity;
  public readonly source: InsightSource;
  public readonly title: string;
  public readonly description: string;
  public readonly recommendation: InsightRecommendation | null;
  public readonly confidenceScore: ConfidenceScore;
  public readonly generatedAt: Date;
  private _isDismissed: boolean;

  constructor(props: InsightProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Insight ID is required.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Insight title is required.');
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Insight description is required.');
    }

    this.id = props.id.trim();
    this.type = props.type;
    this.severity = props.severity;
    this.source = props.source;
    this.title = props.title.trim();
    this.description = props.description.trim();
    this.recommendation = props.recommendation ?? null;
    this.confidenceScore = props.confidenceScore;
    this.generatedAt = props.generatedAt ? new Date(props.generatedAt.getTime()) : new Date();
    this._isDismissed = props.isDismissed ?? false;
  }

  public get isDismissed(): boolean {
    return this._isDismissed;
  }

  public dismiss(): void {
    if (this._isDismissed) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Insight is already dismissed.');
    }
    this._isDismissed = true;
  }
}
