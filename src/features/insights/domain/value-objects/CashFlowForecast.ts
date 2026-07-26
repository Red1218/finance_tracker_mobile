import { ConfidenceScore } from './ConfidenceScore';
import { InsightDomainError } from '../errors/InsightDomainError';

export class CashFlowForecast {
  public readonly predictedIncome: number;
  public readonly predictedExpense: number;
  public readonly confidenceScore: ConfidenceScore;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(props: {
    predictedIncome: number;
    predictedExpense: number;
    confidenceScore: ConfidenceScore;
    startDate: Date;
    endDate: Date;
  }) {
    if (!props.startDate || !props.endDate || props.startDate.getTime() > props.endDate.getTime()) {
      throw new InsightDomainError('INVALID_INSIGHT_STATE', 'Forecast date range is invalid.');
    }

    this.predictedIncome = Math.round(props.predictedIncome * 100) / 100;
    this.predictedExpense = Math.round(props.predictedExpense * 100) / 100;
    this.confidenceScore = props.confidenceScore;
    this.startDate = new Date(props.startDate.getTime());
    this.endDate = new Date(props.endDate.getTime());

    Object.freeze(this);
  }

  public get projectedSavings(): number {
    return Math.round((this.predictedIncome - this.predictedExpense) * 100) / 100;
  }
}
