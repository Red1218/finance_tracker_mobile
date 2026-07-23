import { DashboardDataSnapshot } from '../models/DashboardDataSnapshot';

export interface DashboardReadRepository {
  getDashboardData(userId: string, reportingPeriodId?: string): Promise<DashboardDataSnapshot>;
}
