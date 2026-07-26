import { ReportingDomainError } from '../errors/ReportingDomainError';

export enum ReportingPeriod {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export type ReportingPeriodKind = ReportingPeriod;

export class ReportingPeriodValue {
  public readonly kind: ReportingPeriod;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(kind: ReportingPeriod, startDate: Date, endDate: Date) {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ReportingDomainError(
        'INVALID_REPORTING_PERIOD',
        'Reporting period must have valid start and end dates.'
      );
    }

    if (startDate.getTime() > endDate.getTime()) {
      throw new ReportingDomainError(
        'INVALID_REPORTING_PERIOD',
        'Start date must be before or equal to end date.'
      );
    }

    this.kind = kind;
    this.startDate = new Date(startDate.getTime());
    this.endDate = new Date(endDate.getTime());

    Object.freeze(this);
  }

  public contains(date: Date): boolean {
    if (!date || isNaN(date.getTime())) return false;
    const time = date.getTime();
    return time >= this.startDate.getTime() && time <= this.endDate.getTime();
  }

  public overlaps(other: ReportingPeriodValue): boolean {
    return this.startDate.getTime() <= other.endDate.getTime() && other.startDate.getTime() <= this.endDate.getTime();
  }
}
