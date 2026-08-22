import { describe, it, expect } from 'vitest';
import { RecurrenceRule } from '../value-objects/RecurrenceRule';
import { BillDueDate } from '../value-objects/BillDueDate';
import { BillDomainError } from '../errors/BillDomainError';

describe('RecurrenceRule Value Object', () => {
  describe('Construction & Invariants', () => {
    it('creates a valid RecurrenceRule with explicit anchor day', () => {
      const rule = new RecurrenceRule('MONTHLY', 31);
      expect(rule.type).toBe('MONTHLY');
      expect(rule.anchorDayOfMonth).toBe(31);
    });

    it('creates RecurrenceRule using factory method from initial due date', () => {
      const dueDate = new BillDueDate(new Date('2026-08-15T00:00:00.000Z'));
      const rule = RecurrenceRule.create('MONTHLY', dueDate);
      expect(rule.anchorDayOfMonth).toBe(15);
    });

    it('rejects invalid recurrence type', () => {
      expect(() => new RecurrenceRule('INVALID' as any)).toThrow(BillDomainError);
    });

    it('rejects invalid anchorDayOfMonth (< 1 or > 31)', () => {
      expect(() => new RecurrenceRule('MONTHLY', 0)).toThrow('Anchor day of month must be between 1 and 31.');
      expect(() => new RecurrenceRule('MONTHLY', 32)).toThrow('Anchor day of month must be between 1 and 31.');
    });
  });

  describe('Recurrence Advancement Truth Table', () => {
    it('WEEKLY advances by +7 calendar days', () => {
      const rule = new RecurrenceRule('WEEKLY');
      const start = new BillDueDate(new Date('2026-08-07T00:00:00.000Z'));
      const next = rule.nextOccurrence(start);

      expect(next.toOccurrenceKey()).toBe('2026-08-14');
    });

    it('BIWEEKLY advances by +14 calendar days', () => {
      const rule = new RecurrenceRule('BIWEEKLY');
      const start = new BillDueDate(new Date('2026-08-07T00:00:00.000Z'));
      const next = rule.nextOccurrence(start);

      expect(next.toOccurrenceKey()).toBe('2026-08-21');
    });

    it('MONTHLY Jan 31 clamps to Feb 28 in non-leap year (2026)', () => {
      const rule = new RecurrenceRule('MONTHLY', 31);
      const jan31 = new BillDueDate(new Date('2026-01-31T00:00:00.000Z'));
      const next = rule.nextOccurrence(jan31);

      expect(next.toOccurrenceKey()).toBe('2026-02-28');
    });

    it('MONTHLY Feb 28 (clamped) restores to March 31 anchor day', () => {
      const rule = new RecurrenceRule('MONTHLY', 31);
      const feb28 = new BillDueDate(new Date('2026-02-28T00:00:00.000Z'));
      const next = rule.nextOccurrence(feb28);

      expect(next.toOccurrenceKey()).toBe('2026-03-31');
    });

    it('MONTHLY Jan 31 clamps to Feb 29 in leap year (2028)', () => {
      const rule = new RecurrenceRule('MONTHLY', 31);
      const jan31Leap = new BillDueDate(new Date('2028-01-31T00:00:00.000Z'));
      const next = rule.nextOccurrence(jan31Leap);

      expect(next.toOccurrenceKey()).toBe('2028-02-29');
    });

    it('QUARTERLY Jan 31 clamps to April 30 (+3 months)', () => {
      const rule = new RecurrenceRule('QUARTERLY', 31);
      const jan31 = new BillDueDate(new Date('2026-01-31T00:00:00.000Z'));
      const next = rule.nextOccurrence(jan31);

      expect(next.toOccurrenceKey()).toBe('2026-04-30');
    });

    it('YEARLY Feb 29 in leap year (2028) clamps to Feb 28 in non-leap year (2029)', () => {
      const rule = new RecurrenceRule('YEARLY', 29);
      const feb29Leap = new BillDueDate(new Date('2028-02-29T00:00:00.000Z'));
      const next = rule.nextOccurrence(feb29Leap);

      expect(next.toOccurrenceKey()).toBe('2029-02-28');
    });

    it('YEARLY Feb 28 non-leap restores to Feb 29 in leap year (2032)', () => {
      const rule = new RecurrenceRule('YEARLY', 29);

      let current = new BillDueDate(new Date('2028-02-29T00:00:00.000Z'));
      current = rule.nextOccurrence(current); // 2029-02-28
      current = rule.nextOccurrence(current); // 2030-02-28
      current = rule.nextOccurrence(current); // 2031-02-28
      current = rule.nextOccurrence(current); // 2032-02-29 (leap year restored)

      expect(current.toOccurrenceKey()).toBe('2032-02-29');
    });

    it('NONE returns unchanged due date', () => {
      const rule = new RecurrenceRule('NONE');
      const start = new BillDueDate(new Date('2026-08-21T00:00:00.000Z'));
      const next = rule.nextOccurrence(start);

      expect(next.toOccurrenceKey()).toBe('2026-08-21');
    });
  });
});
