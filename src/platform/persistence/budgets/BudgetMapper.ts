import { BudgetRow } from '../../../features/budgets/contracts';
import { 
  Budget, 
  BudgetId, 
  BudgetAmount, 
  BudgetPeriod, 
  BudgetStatus 
} from '../../../features/budgets/domain';
import { CurrencyCode } from '../../../features/expenses/domain/value-objects/CurrencyCode';
import { CategoryId } from '../../../features/categories/domain';

export class BudgetMapper {
  public static toDomain(row: BudgetRow): Budget {
    return new Budget({
      id: new BudgetId(row.id),
      categoryId: row.category_id ? new CategoryId(row.category_id) : null,
      amount: new BudgetAmount(row.amount),
      currency: new CurrencyCode(row.currency_code),
      period: new BudgetPeriod(row.period),
      status: new BudgetStatus(row.status),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }

  public static toPersistence(entity: Budget): Omit<BudgetRow, 'created_at' | 'updated_at'> {
    return {
      id: entity.id.value,
      category_id: entity.categoryId?.value ?? null,
      amount: entity.amount.value,
      currency_code: entity.currency.value,
      period: entity.period.value,
      status: entity.status.value,
      deleted_at: entity.deletedAt ? BudgetMapper.toDbDate(entity.deletedAt) : null,
    };
  }

  public static toDbDate(date: Date): string {
    return date.toISOString();
  }
}
