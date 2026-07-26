import { BudgetDomainError } from '../errors/BudgetDomainError';

export enum BudgetPeriodType {
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Yearly = 'YEARLY',
  Custom = 'CUSTOM',
}

export class BudgetPeriod {
  public readonly kind: BudgetPeriodType;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(kind: BudgetPeriodType, startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new BudgetDomainError(
        'INVALID_DATE_RANGE',
        'Budget start date must be strictly before end date.'
      );
    }

    this.kind = kind;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);

    Object.freeze(this);
  }

  public intersects(other: BudgetPeriod): boolean {
    return this.startDate <= other.endDate && other.startDate <= this.endDate;
  }

  public equals(other: BudgetPeriod): boolean {
    return (
      this.kind === other.kind &&
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }
}
