import { BudgetDomainError } from '../errors/BudgetDomainError';

export class BudgetPeriod {
  public readonly value: string;
  private static readonly PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

  constructor(value: string) {
    const trimmed = value.trim();

    if (!BudgetPeriod.PERIOD_REGEX.test(trimmed)) {
      throw new BudgetDomainError(
        'INVALID_PERIOD_FORMAT',
        'Budget period must be in YYYY-MM format.'
      );
    }

    this.value = trimmed;
    Object.freeze(this);
  }

  public get year(): number {
    return parseInt(this.value.split('-')[0], 10);
  }

  public get month(): number {
    return parseInt(this.value.split('-')[1], 10);
  }

  public static current(): BudgetPeriod {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return new BudgetPeriod(`${year}-${month}`);
  }

  public previous(): BudgetPeriod {
    let prevYear = this.year;
    let prevMonth = this.month - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const monthStr = String(prevMonth).padStart(2, '0');
    return new BudgetPeriod(`${prevYear}-${monthStr}`);
  }

  public next(): BudgetPeriod {
    let nextYear = this.year;
    let nextMonth = this.month + 1;

    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }

    const monthStr = String(nextMonth).padStart(2, '0');
    return new BudgetPeriod(`${nextYear}-${monthStr}`);
  }

  public isCurrent(): boolean {
    return this.equals(BudgetPeriod.current());
  }

  public contains(date: Date): boolean {
    return date.getFullYear() === this.year && (date.getMonth() + 1) === this.month;
  }

  public equals(other: BudgetPeriod): boolean {
    return this.value === other.value;
  }
}
