import { CategoryBreakdown } from '../../domain';
import { RawCategoryBreakdown } from '../datasources/ReportingDataSource';

export class CategoryBreakdownInfraMapper {
  public static toDomain(
    rows: (RawCategoryBreakdown & { _grand_total?: number })[]
  ): CategoryBreakdown[] {
    const grandTotal = rows[0]?._grand_total ?? rows.reduce((s, r) => s + r.total_amount, 0);

    return rows.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      amount: r.total_amount,
      percentage: grandTotal > 0 ? (r.total_amount / grandTotal) * 100 : 0,
      transactionCount: r.transaction_count,
    }));
  }
}
