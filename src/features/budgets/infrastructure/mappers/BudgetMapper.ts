import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';
import { BudgetRecord } from '../types/BudgetRecord';

export class BudgetMapper {
  public static toDomain(record: BudgetRecord): Budget {
    return Budget.restore({
      id: new BudgetId(record.id),
      categoryId: record.category_id ? new CategoryId(record.category_id) : null,
      amount: new BudgetAmount(record.amount),
      currency: new CurrencyCode('INR'),
      period: record.period as BudgetPeriod,
      startDate: new Date(record.start_date),
      endDate: new Date(record.end_date),
    });
  }

  public static toPersistence(budget: Budget): BudgetRecord {
    return {
      id: budget.id.value,
      category_id: budget.categoryId?.value ?? null,
      amount: budget.amount.value,
      period: budget.period,
      start_date: budget.startDate.toISOString(),
      end_date: budget.endDate.toISOString(),
    };
  }
}
