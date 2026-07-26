import { BudgetRow } from '../../contracts/BudgetRow';
import { BudgetMapper } from '../../../../platform/persistence/budgets/BudgetMapper';
import { Budget } from '../../domain';

export interface BudgetSummaryRecord {
  budget: BudgetRow;
  spent_amount: number;
}

export class BudgetSummaryMapper {
  public static toProjection(record: BudgetSummaryRecord): { budget: Budget; spentAmount: number } {
    return {
      budget: BudgetMapper.toDomain(record.budget),
      spentAmount: record.spent_amount,
    };
  }
}
