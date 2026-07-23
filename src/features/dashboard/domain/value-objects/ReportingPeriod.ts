export type PeriodType = 'CurrentMonth' | 'LastMonth' | 'CurrentYear' | 'CustomRange';

export class ReportingPeriod {
  constructor(
    public readonly type: PeriodType,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate.getTime() > endDate.getTime()) {
      throw new Error('Start date must be before or equal to end date');
    }
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
