import { MonthlyTrendPoint } from '../../domain';
import { MonthlyTrendResponse, MonthlyTrendPointItem } from '../responses/MonthlyTrendResponse';

export class MonthlyTrendMapper {
  public static toResponse(projections: MonthlyTrendPoint[]): MonthlyTrendResponse {
    const items: MonthlyTrendPointItem[] = projections.map((p) => ({
      period: p.period,
      income: p.income,
      expenses: p.expenses,
      netCashFlow: p.netCashFlow,
    }));
    return { items };
  }
}
