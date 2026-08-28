import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../../features/budgets/domain';
import { CategoryId } from '../../../features/categories/domain';
import { CurrencyCode } from '../../../features/accounts/domain/value-objects/CurrencyCode';
import { BudgetRow } from '../../../features/budgets/contracts/BudgetRow';

export class BudgetMapper {
  public static toDomain(row: BudgetRow): Budget {
    const periodKindStr = row.period_kind ?? 'MONTHLY';
    return new Budget({
      id: new BudgetId(row.id),
      categoryId: row.category_id ? new CategoryId(row.category_id) : null,
      amount: new BudgetAmount(row.amount),
      currency: new CurrencyCode(row.currency_code ?? 'INR'),
      period: new BudgetPeriod(
        periodKindStr as BudgetPeriodType,
        new Date(row.start_date),
        new Date(row.end_date)
      ),
      archivedAt: row.archived_at ? new Date(row.archived_at) : null,
    });
  }

  public static toPersistence(budget: Budget, userId: string = 'system'): BudgetRow {
    return {
      id: budget.id.value,
      user_id: userId,
      category_id: budget.categoryId?.value ?? null,
      amount: budget.amount.value,
      currency_code: budget.currency.value,
      period_kind: budget.period.kind,
      start_date: budget.startDate.toISOString(),
      end_date: budget.endDate.toISOString(),
      archived_at: budget.archivedAt ? budget.archivedAt.toISOString() : null,
    };
  }
}
