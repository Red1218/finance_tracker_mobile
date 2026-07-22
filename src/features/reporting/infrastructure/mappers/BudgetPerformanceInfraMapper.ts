import { BudgetPerformance, BudgetPerformanceStatus } from '../../domain';
import { RawBudgetPerformance } from '../datasources/ReportingDataSource';

/**
 * Derives budget status from utilization.
 * This is the ONLY place budget status is determined — Infrastructure MUST NOT
 * return status from the database; the Application layer MUST NOT compute it.
 */
function deriveStatus(utilization: number): BudgetPerformanceStatus {
  if (utilization >= 100) return 'Over Budget';
  if (utilization >= 80) return 'Near Limit';
  return 'Safe';
}

export class BudgetPerformanceInfraMapper {
  public static toDomain(rows: RawBudgetPerformance[]): BudgetPerformance[] {
    return rows.map((r) => {
      const remaining = r.budget_amount - r.actual_spent;
      const utilization = r.budget_amount > 0
        ? (r.actual_spent / r.budget_amount) * 100
        : 0;

      return {
        budgetId: r.budget_id,
        categoryId: r.category_id,
        categoryName: r.category_name,
        budgetAmount: r.budget_amount,
        actualSpent: r.actual_spent,
        remaining,
        utilization,
        status: deriveStatus(utilization),
      };
    });
  }
}
