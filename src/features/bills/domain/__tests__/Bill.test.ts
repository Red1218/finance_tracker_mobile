import { describe, it, expect } from 'vitest';
import { Bill, BillProps } from '../entities/Bill';
import { BillId } from '../value-objects/BillId';
import { BillName } from '../value-objects/BillName';
import { BillAmount } from '../value-objects/BillAmount';
import { BillDueDate } from '../value-objects/BillDueDate';
import { RecurrenceRule } from '../value-objects/RecurrenceRule';
import { CurrencyCode } from '../../../accounts/domain';
import { BillDomainError } from '../errors/BillDomainError';

describe('Bill Aggregate Root', () => {
  const createValidProps = (): BillProps => ({
    id: new BillId('bill-123'),
    userId: 'user-456',
    name: new BillName('Electricity Bill'),
    amount: new BillAmount(1500, new CurrencyCode('INR')),
    categoryId: 'cat-789',
    recurrence: new RecurrenceRule('MONTHLY', 15),
    nextDueDate: new BillDueDate(new Date('2026-09-15T00:00:00.000Z')),
  });

  describe('Instantiation & Invariants', () => {
    it('instantiates a valid Bill aggregate', () => {
      const props = createValidProps();
      const bill = new Bill(props);

      expect(bill.id.value).toBe('bill-123');
      expect(bill.userId).toBe('user-456');
      expect(bill.name.value).toBe('Electricity Bill');
      expect(bill.amount.amount).toBe(1500);
      expect(bill.amount.currencyCode.value).toBe('INR');
      expect(bill.categoryId).toBe('cat-789');
      expect(bill.recurrence.type).toBe('MONTHLY');
      expect(bill.recurrence.anchorDayOfMonth).toBe(15);
      expect(bill.nextDueDate.toOccurrenceKey()).toBe('2026-09-15');
      expect(bill.isArchived).toBe(false);
    });

    it('rejects invalid BillId', () => {
      expect(() => new BillId('')).toThrow(BillDomainError);
      expect(() => new BillId('   ')).toThrow('Bill identifier cannot be empty.');
    });

    it('rejects invalid userId', () => {
      const props = { ...createValidProps(), userId: '  ' };
      expect(() => new Bill(props)).toThrow(BillDomainError);
    });

    it('rejects empty or overly long BillName', () => {
      expect(() => new BillName('')).toThrow('Bill name must be between 1 and 100 characters.');
      expect(() => new BillName('a'.repeat(101))).toThrow('Bill name must be between 1 and 100 characters.');
    });

    it('rejects non-positive BillAmount', () => {
      const currency = new CurrencyCode('INR');
      expect(() => new BillAmount(0, currency)).toThrow('Bill amount must be strictly greater than zero.');
      expect(() => new BillAmount(-50, currency)).toThrow('Bill amount must be strictly greater than zero.');
    });
  });

  describe('Archival Logic', () => {
    it('archives an active bill', () => {
      const bill = new Bill(createValidProps());
      const archiveDate = new Date('2026-08-21T10:00:00.000Z');
      const archivedBill = bill.archive(archiveDate);

      expect(archivedBill.isArchived).toBe(true);
      expect(archivedBill.archivedAt?.toISOString()).toBe(archiveDate.toISOString());
    });

    it('throws error when archiving an already archived bill', () => {
      const bill = new Bill(createValidProps()).archive();
      expect(() => bill.archive()).toThrow('Bill is already archived.');
    });
  });

  describe('Recurrence Advancement', () => {
    it('advances a recurring bill to the next occurrence', () => {
      const bill = new Bill(createValidProps());
      const nextBill = bill.advanceToNextOccurrence();

      expect(nextBill.isArchived).toBe(false);
      expect(nextBill.nextDueDate.toOccurrenceKey()).toBe('2026-10-15');
    });

    it('archives a non-recurring bill (NONE) upon advancement', () => {
      const props = {
        ...createValidProps(),
        recurrence: new RecurrenceRule('NONE', 15),
      };
      const bill = new Bill(props);
      const advancedBill = bill.advanceToNextOccurrence();

      expect(advancedBill.isArchived).toBe(true);
      expect(advancedBill.archivedAt).not.toBeNull();
    });

    it('throws error when advancing an archived bill', () => {
      const bill = new Bill(createValidProps()).archive();
      expect(() => bill.advanceToNextOccurrence()).toThrow('Cannot advance an archived bill.');
    });
  });
});
