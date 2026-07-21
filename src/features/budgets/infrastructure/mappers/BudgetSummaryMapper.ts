import { BudgetSummaryData } from '../../application/projections/BudgetSummaryData';
import { BudgetRecord } from '../types/BudgetRecord';
import { BudgetMapper } from './BudgetMapper';

export interface BudgetSummaryRecord {
  budget: BudgetRecord;
  spent_amount: number;
}

export class BudgetSummaryMapper {
  public static toProjection(record: BudgetSummaryRecord): BudgetSummaryData {
    return {
      budget: BudgetMapper.toDomain(record.budget),
      spentAmount: record.spent_amount,
    };
  }
}
