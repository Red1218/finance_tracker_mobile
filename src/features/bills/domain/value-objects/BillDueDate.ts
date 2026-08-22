import { BillDomainError } from '../errors/BillDomainError';

export class BillDueDate {
  public readonly value: Date;

  constructor(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new BillDomainError('INVALID_DUE_DATE', 'Bill due date must be a valid date.');
    }

    // Normalize to UTC Midnight (00:00:00.000Z) to eliminate timezone skew
    const utcNormalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    this.value = utcNormalized;

    Object.freeze(this);
  }

  public static fromUtcString(utcString: string): BillDueDate {
    const parsed = new Date(utcString);
    return new BillDueDate(parsed);
  }

  private normalizeAsOf(asOf: Date): Date {
    return new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  }

  public isToday(asOf: Date = new Date()): boolean {
    const target = this.normalizeAsOf(asOf);
    return this.value.getTime() === target.getTime();
  }

  public isOverdue(asOf: Date = new Date()): boolean {
    const target = this.normalizeAsOf(asOf);
    return this.value.getTime() < target.getTime();
  }

  public daysUntilDue(asOf: Date = new Date()): number {
    const target = this.normalizeAsOf(asOf);
    const diffMs = this.value.getTime() - target.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  public toOccurrenceKey(): string {
    const year = this.value.getUTCFullYear();
    const month = String(this.value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(this.value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public equals(other: BillDueDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
