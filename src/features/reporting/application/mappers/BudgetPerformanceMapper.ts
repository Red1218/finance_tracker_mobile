import { BudgetPerformance } from '../../domain';
import { BudgetPerformanceResponse, BudgetPerformanceItem } from '../responses/BudgetPerformanceResponse';

export class BudgetPerformanceMapper {
  public static toResponse(projections: BudgetPerformance[]): BudgetPerformanceResponse {
    const items: BudgetPerformanceItem[] = projections.map((p) => ({
      budgetId: p.budgetId,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      budgetAmount: p.budgetAmount,
      actualSpent: p.actualSpent,
      remaining: p.remaining,
      utilization: p.utilization,
      status: p.status,
    }));
    return { items };
  }
}
