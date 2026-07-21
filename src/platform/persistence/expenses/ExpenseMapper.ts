import { ExpenseRow } from '../../../features/expenses/contracts';
import { 
  Expense, 
  ExpenseId, 
  ExpenseAmount, 
  CurrencyCode, 
  ExpenseDate, 
  ExpenseNote, 
  MerchantName, 
  PaymentMethod 
} from '../../../features/expenses/domain';
import { CategoryId } from '../../../features/categories/domain';

export class ExpenseMapper {
  public static toDomain(row: ExpenseRow): Expense {
    return new Expense({
      id: new ExpenseId(row.id),
      categoryId: new CategoryId(row.category_id),
      amount: new ExpenseAmount(row.amount),
      currency: new CurrencyCode(row.currency_code),
      date: new ExpenseDate(row.date),
      paymentMethod: new PaymentMethod(row.payment_method),
      note: row.note ? new ExpenseNote(row.note) : undefined,
      merchant: row.merchant ? new MerchantName(row.merchant) : undefined,
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
    });
  }

  public static toPersistence(entity: Expense): Omit<ExpenseRow, 'created_at' | 'updated_at'> {
    return {
      id: entity.id.value,
      category_id: entity.categoryId.value,
      amount: entity.amount.value,
      currency_code: entity.currency.value,
      date: ExpenseMapper.toDbDate(entity.date.value),
      payment_method: entity.paymentMethod.value,
      note: entity.note?.value ?? null,
      merchant: entity.merchant?.value ?? null,
      deleted_at: entity.deletedAt ? entity.deletedAt.toISOString() : null,
    };
  }

  public static toDbDate(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }
}
