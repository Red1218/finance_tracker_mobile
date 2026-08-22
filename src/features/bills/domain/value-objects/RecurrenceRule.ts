import { BillDomainError } from '../errors/BillDomainError';
import { BillDueDate } from './BillDueDate';

export type RecurrenceType = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export class RecurrenceRule {
  public readonly type: RecurrenceType;
  public readonly anchorDayOfMonth: number;

  constructor(type: RecurrenceType, anchorDayOfMonth?: number) {
    const validTypes: RecurrenceType[] = ['NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
    if (!validTypes.includes(type)) {
      throw new BillDomainError('INVALID_RECURRENCE', `Invalid recurrence type: ${type}`);
    }

    if (anchorDayOfMonth !== undefined) {
      if (typeof anchorDayOfMonth !== 'number' || anchorDayOfMonth < 1 || anchorDayOfMonth > 31) {
        throw new BillDomainError('INVALID_RECURRENCE', 'Anchor day of month must be between 1 and 31.');
      }
      this.anchorDayOfMonth = anchorDayOfMonth;
    } else {
      this.anchorDayOfMonth = 1;
    }

    this.type = type;
    Object.freeze(this);
  }

  public static create(type: RecurrenceType, initialDueDate?: BillDueDate): RecurrenceRule {
    const anchor = initialDueDate ? initialDueDate.value.getUTCDate() : 1;
    return new RecurrenceRule(type, anchor);
  }

  public nextOccurrence(currentDueDate: BillDueDate): BillDueDate {
    if (this.type === 'NONE') {
      return currentDueDate;
    }

    const currentDate = currentDueDate.value;
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth();
    const currentDay = currentDate.getUTCDate();

    if (this.type === 'WEEKLY') {
      const nextDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return new BillDueDate(nextDate);
    }

    if (this.type === 'BIWEEKLY') {
      const nextDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      return new BillDueDate(nextDate);
    }

    if (this.type === 'MONTHLY' || this.type === 'QUARTERLY') {
      const monthsToAdd = this.type === 'MONTHLY' ? 1 : 3;
      const targetMonthTotal = currentMonth + monthsToAdd;
      const targetYear = currentYear + Math.floor(targetMonthTotal / 12);
      const targetMonth = targetMonthTotal % 12;

      // Get last day of target month
      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const targetDay = Math.min(this.anchorDayOfMonth, daysInTargetMonth);

      const nextDate = new Date(Date.UTC(targetYear, targetMonth, targetDay));
      return new BillDueDate(nextDate);
    }

    if (this.type === 'YEARLY') {
      const targetYear = currentYear + 1;
      const targetMonth = currentMonth;

      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const targetDay = Math.min(this.anchorDayOfMonth, daysInTargetMonth);

      const nextDate = new Date(Date.UTC(targetYear, targetMonth, targetDay));
      return new BillDueDate(nextDate);
    }

    return currentDueDate;
  }

  public equals(other: RecurrenceRule): boolean {
    return this.type === other.type && this.anchorDayOfMonth === other.anchorDayOfMonth;
  }
}
