import { LargestTransaction } from '../../domain';
import { RawLargestTransaction } from '../datasources/ReportingDataSource';

export class LargestTransactionInfraMapper {
  public static toDomain(rows: RawLargestTransaction[]): LargestTransaction[] {
    return rows.map((r) => ({
      expenseId: r.expense_id,
      merchant: r.merchant,
      categoryName: r.category_name,
      amount: r.amount,
      transactionDate: r.transaction_date,
    }));
  }
}
