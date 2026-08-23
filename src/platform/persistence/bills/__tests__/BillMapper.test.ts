import { describe, it, expect } from 'vitest';
import { BillMapper } from '../BillMapper';
import { BillRow } from '../../../../features/bills/contracts/BillRow';
import { Bill, BillId, BillName, BillAmount, BillDueDate, RecurrenceRule, CurrencyCode } from '../../../../features/bills/domain';

describe('BillMapper', () => {
  const sampleRow: BillRow = {
    id: 'bill-100',
    user_id: 'user-789',
    category_id: 'cat-456',
    name: 'Netflix Subscription',
    amount: 500,
    currency_code: 'INR',
    recurrence_kind: 'MONTHLY',
    anchor_day_of_month: 21,
    next_due_date: '2026-08-21T00:00:00.000Z',
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    archived_at: null,
  };

  it('maps active BillRow to Bill domain entity', () => {
    const bill = BillMapper.toDomain(sampleRow);

    expect(bill.id.value).toBe('bill-100');
    expect(bill.userId).toBe('user-789');
    expect(bill.name.value).toBe('Netflix Subscription');
    expect(bill.amount.amount).toBe(500);
    expect(bill.amount.currencyCode.value).toBe('INR');
    expect(bill.categoryId).toBe('cat-456');
    expect(bill.recurrence.type).toBe('MONTHLY');
    expect(bill.recurrence.anchorDayOfMonth).toBe(21);
    expect(bill.nextDueDate.value.toISOString()).toBe('2026-08-21T00:00:00.000Z');
    expect(bill.isArchived).toBe(false);
  });

  it('maps archived BillRow to Bill domain entity', () => {
    const archivedRow: BillRow = {
      ...sampleRow,
      archived_at: '2026-08-01T12:00:00.000Z',
    };

    const bill = BillMapper.toDomain(archivedRow);
    expect(bill.isArchived).toBe(true);
    expect(bill.archivedAt?.toISOString()).toBe('2026-08-01T12:00:00.000Z');
  });

  it('maps Bill domain entity to BillRow persistence object', () => {
    const bill = new Bill({
      id: new BillId('bill-100'),
      userId: 'user-789',
      name: new BillName('Rent'),
      amount: new BillAmount(15000, new CurrencyCode('INR')),
      categoryId: 'cat-home',
      recurrence: new RecurrenceRule('MONTHLY', 1),
      nextDueDate: new BillDueDate(new Date('2026-09-01T00:00:00.000Z')),
    });

    const row = BillMapper.toPersistence(bill);

    expect(row.id).toBe('bill-100');
    expect(row.user_id).toBe('user-789');
    expect(row.category_id).toBe('cat-home');
    expect(row.name).toBe('Rent');
    expect(row.amount).toBe(15000);
    expect(row.currency_code).toBe('INR');
    expect(row.recurrence_kind).toBe('MONTHLY');
    expect(row.anchor_day_of_month).toBe(1);
    expect(row.next_due_date).toBe('2026-09-01T00:00:00.000Z');
    expect(row.archived_at).toBeNull();
  });
});
