import { CategoryBreakdown } from '../../domain';
import { CategoryBreakdownResponse, CategoryBreakdownItem } from '../responses/CategoryBreakdownResponse';

export class CategoryBreakdownMapper {
  public static toResponse(projections: CategoryBreakdown[]): CategoryBreakdownResponse {
    const items: CategoryBreakdownItem[] = projections.map((p) => ({
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      amount: p.amount,
      percentage: p.percentage,
      transactionCount: p.transactionCount,
    }));
    return { items };
  }
}
