import { describe, it, expect } from 'vitest';
import { BillSchedulingService } from '../services/BillSchedulingService';
import { Bill } from '../entities/Bill';
import { BillId } from '../value-objects/BillId';
import { BillName } from '../value-objects/BillName';
import { BillAmount } from '../value-objects/BillAmount';
import { BillDueDate } from '../value-objects/BillDueDate';
import { RecurrenceRule } from '../value-objects/RecurrenceRule';
import { CurrencyCode } from '../value-objects/CurrencyCode';

describe('BillSchedulingService Domain Service', () => {
  const asOfDate = new Date('2026-08-21T00:00:00.000Z');

  const createTestBill = (dueDateString: string, recurrenceType: any = 'MONTHLY', isArchived: boolean = false): Bill => {
    let bill = new Bill({
      id: new BillId('bill-1'),
      userId: 'user-1',
      name: new BillName('Rent'),
      amount: new BillAmount(20000, new CurrencyCode('INR')),
      recurrence: new RecurrenceRule(recurrenceType, 21),
      nextDueDate: new BillDueDate(new Date(dueDateString)),
    });

    if (isArchived) {
      bill = bill.archive(new Date('2026-08-01T00:00:00.000Z'));
    }

    return bill;
  };

  describe('resolveStatus Precedence Matrix', () => {
    it('returns Archived when archivedAt is not null, even if overdue', () => {
      const bill = createTestBill('2026-08-01T00:00:00.000Z', 'MONTHLY', true);
      const status = BillSchedulingService.resolveStatus(bill, asOfDate);

      expect(status).toBe('Archived');
    });

    it('returns Overdue when nextDueDate is prior to asOf date', () => {
      const bill = createTestBill('2026-08-20T00:00:00.000Z');
      const status = BillSchedulingService.resolveStatus(bill, asOfDate);

      expect(status).toBe('Overdue');
    });

    it('returns DueToday when nextDueDate matches asOf date', () => {
      const bill = createTestBill('2026-08-21T00:00:00.000Z');
      const status = BillSchedulingService.resolveStatus(bill, asOfDate);

      expect(status).toBe('DueToday');
    });

    it('returns Upcoming when nextDueDate is after asOf date', () => {
      const bill = createTestBill('2026-08-22T00:00:00.000Z');
      const status = BillSchedulingService.resolveStatus(bill, asOfDate);

      expect(status).toBe('Upcoming');
    });
  });

  describe('advanceBill', () => {
    it('advances a recurring bill to the next occurrence', () => {
      const bill = createTestBill('2026-08-21T00:00:00.000Z', 'MONTHLY');
      const advanced = BillSchedulingService.advanceBill(bill);

      expect(advanced.isArchived).toBe(false);
      expect(advanced.nextDueDate.toOccurrenceKey()).toBe('2026-09-21');
    });

    it('archives a non-recurring bill (NONE)', () => {
      const bill = createTestBill('2026-08-21T00:00:00.000Z', 'NONE');
      const advanced = BillSchedulingService.advanceBill(bill, asOfDate);

      expect(advanced.isArchived).toBe(true);
      expect(advanced.archivedAt?.toISOString()).toBe(asOfDate.toISOString());
    });
  });
});
