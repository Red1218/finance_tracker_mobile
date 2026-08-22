import { Bill } from '../entities/Bill';
import { BillDueDate } from '../value-objects/BillDueDate';
import { RecurrenceRule } from '../value-objects/RecurrenceRule';

export type BillStatus = 'Upcoming' | 'DueToday' | 'Overdue' | 'Archived';

export class BillSchedulingService {
  /**
   * Resolves the derived BillStatus according to strict precedence rules:
   * 1. Archived (archivedAt !== null)
   * 2. Overdue (nextDueDate < asOf)
   * 3. DueToday (nextDueDate === asOf)
   * 4. Upcoming (nextDueDate > asOf)
   */
  public static resolveStatus(bill: Bill, asOf: Date = new Date()): BillStatus {
    if (bill.isArchived) {
      return 'Archived';
    }

    if (bill.nextDueDate.isOverdue(asOf)) {
      return 'Overdue';
    }

    if (bill.nextDueDate.isToday(asOf)) {
      return 'DueToday';
    }

    return 'Upcoming';
  }

  /**
   * Calculates the next due date based on the RecurrenceRule and anchorDayOfMonth.
   */
  public static calculateNextDueDate(currentDueDate: BillDueDate, recurrence: RecurrenceRule): BillDueDate {
    return recurrence.nextOccurrence(currentDueDate);
  }

  /**
   * Advances a Bill to its next occurrence or archives it if non-recurring (NONE).
   */
  public static advanceBill(bill: Bill, now: Date = new Date()): Bill {
    return bill.advanceToNextOccurrence(now);
  }
}
