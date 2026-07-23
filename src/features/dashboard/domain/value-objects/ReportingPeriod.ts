export type PeriodType = 'CurrentMonth' | 'LastMonth' | 'CurrentYear' | 'CustomRange';

export class ReportingPeriod {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  constructor(
    public readonly type: PeriodType,
    startDate: Date,
    endDate: Date
  ) {
    if (startDate.getTime() > endDate.getTime()) {
      throw new Error('Start date must be before or equal to end date');
    }
    this._startDate = new Date(startDate.getTime());
    this._endDate = new Date(endDate.getTime());
  }

  get startDate(): Date {
    return new Date(this._startDate.getTime());
  }

  get endDate(): Date {
    return new Date(this._endDate.getTime());
  }

  equals(other: ReportingPeriod): boolean {
    return this.type === other.type &&
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime();
  }

  contains(date: Date): boolean {
    return date.getTime() >= this.startDate.getTime() && date.getTime() <= this.endDate.getTime();
  }
}
