import { BillId } from '../value-objects/BillId';
import { BillName } from '../value-objects/BillName';
import { BillAmount } from '../value-objects/BillAmount';
import { BillDueDate } from '../value-objects/BillDueDate';
import { RecurrenceRule } from '../value-objects/RecurrenceRule';
import { BillDomainError } from '../errors/BillDomainError';

export interface BillProps {
  id: BillId;
  userId: string;
  name: BillName;
  amount: BillAmount;
  categoryId?: string | null;
  recurrence: RecurrenceRule;
  nextDueDate: BillDueDate;
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?: Date | null;
}

export class Bill {
  public readonly id: BillId;
  public readonly userId: string;
  public readonly name: BillName;
  public readonly amount: BillAmount;
  public readonly categoryId: string | null;
  public readonly recurrence: RecurrenceRule;
  public readonly nextDueDate: BillDueDate;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly archivedAt: Date | null;

  constructor(props: BillProps) {
    if (!props.userId || typeof props.userId !== 'string' || props.userId.trim().length === 0) {
      throw new BillDomainError('INVALID_BILL_ID', 'User identifier cannot be empty.');
    }

    this.id = props.id;
    this.userId = props.userId.trim();
    this.name = props.name;
    this.amount = props.amount;
    this.categoryId = props.categoryId ?? null;
    this.recurrence = props.recurrence;
    this.nextDueDate = props.nextDueDate;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.archivedAt = props.archivedAt ?? null;

    Object.freeze(this);
  }

  public get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  public archive(archivedAt: Date = new Date()): Bill {
    if (this.isArchived) {
      throw new BillDomainError('BILL_ALREADY_ARCHIVED', 'Bill is already archived.');
    }

    return new Bill({
      id: this.id,
      userId: this.userId,
      name: this.name,
      amount: this.amount,
      categoryId: this.categoryId,
      recurrence: this.recurrence,
      nextDueDate: this.nextDueDate,
      createdAt: this.createdAt,
      updatedAt: archivedAt,
      archivedAt,
    });
  }

  public advanceToNextOccurrence(now: Date = new Date()): Bill {
    if (this.isArchived) {
      throw new BillDomainError('BILL_ALREADY_ARCHIVED', 'Cannot advance an archived bill.');
    }

    if (this.recurrence.type === 'NONE') {
      return this.archive(now);
    }

    const nextDueDate = this.recurrence.nextOccurrence(this.nextDueDate);

    return new Bill({
      id: this.id,
      userId: this.userId,
      name: this.name,
      amount: this.amount,
      categoryId: this.categoryId,
      recurrence: this.recurrence,
      nextDueDate,
      createdAt: this.createdAt,
      updatedAt: now,
      archivedAt: null,
    });
  }
}
