import { DashboardSummary } from '../../domain';
import { DashboardSummaryResponse } from '../responses/DashboardSummaryResponse';

export class DashboardSummaryMapper {
  public static toResponse(projection: DashboardSummary): DashboardSummaryResponse {
    return {
      totalIncome: projection.totalIncome,
      totalExpenses: projection.totalExpenses,
      netCashFlow: projection.netCashFlow,
      savingsRate: projection.savingsRate,
      transactionCount: projection.transactionCount,
    };
  }
}
