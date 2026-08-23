import {
  Bill,
  BillId,
  BillName,
  BillAmount,
  BillDueDate,
  RecurrenceRule,
  CurrencyCode,
  RecurrenceType,
} from '../../../features/bills/domain';
import { BillRow } from '../../../features/bills/contracts/BillRow';

export class BillMapper {
  public static toDomain(row: BillRow): Bill {
    return new Bill({
      id: new BillId(row.id),
      userId: row.user_id,
      name: new BillName(row.name),
      amount: new BillAmount(row.amount, new CurrencyCode(row.currency_code ?? 'INR')),
      categoryId: row.category_id ?? null,
      recurrence: new RecurrenceRule(
        row.recurrence_kind as RecurrenceType,
        row.anchor_day_of_month ?? 1
      ),
      nextDueDate: new BillDueDate(new Date(row.next_due_date)),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      archivedAt: row.archived_at ? new Date(row.archived_at) : null,
    });
  }

  public static toPersistence(bill: Bill): BillRow {
    return {
      id: bill.id.value,
      user_id: bill.userId,
      category_id: bill.categoryId,
      name: bill.name.value,
      amount: bill.amount.amount,
      currency_code: bill.amount.currencyCode.value,
      recurrence_kind: bill.recurrence.type,
      anchor_day_of_month: bill.recurrence.anchorDayOfMonth,
      next_due_date: bill.nextDueDate.value.toISOString(),
      created_at: bill.createdAt.toISOString(),
      updated_at: bill.updatedAt.toISOString(),
      archived_at: bill.archivedAt ? bill.archivedAt.toISOString() : null,
    };
  }
}
