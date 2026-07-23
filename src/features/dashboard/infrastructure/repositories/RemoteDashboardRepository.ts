import { DashboardReadRepository } from '../../application/ports/DashboardReadRepository';
import { DashboardDataSnapshot } from '../../application/models/DashboardDataSnapshot';
import { Logger } from '../../application/ports/Logger';
import { TelemetryProvider } from '../../application/ports/TelemetryProvider';

export class RemoteDashboardRepository implements DashboardReadRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly logger: Logger,
    private readonly telemetry: TelemetryProvider
  ) {}

  async getDashboardData(userId: string, reportingPeriodId?: string): Promise<DashboardDataSnapshot> {
    const endTimer = this.telemetry.startTimer('RemoteDashboardRepository.getDashboardData');
    this.logger.debug(`Fetching dashboard data for user: ${userId}`, { userId, reportingPeriodId });

    try {
      const url = new URL(`${this.baseUrl}/api/dashboard`);
      url.searchParams.append('userId', userId);
      if (reportingPeriodId) {
        url.searchParams.append('period', reportingPeriodId);
      }

      // We use AbortController to enforce strict transport timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          // Assuming authorization is handled by an interceptor or injected context
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse dates from JSON strings back into Date objects for the snapshot
      const snapshot: DashboardDataSnapshot = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budgets: data.budgets || [],
        categories: data.categories || [],
        transactions: data.transactions?.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })) || []
      };

      this.telemetry.trackDependency('DashboardAPI', endTimer(), true);
      return snapshot;

    } catch (error: any) {
      this.telemetry.trackDependency('DashboardAPI', endTimer(), false);
      this.logger.error('Failed to fetch remote dashboard data', error, { userId });
      
      if (error.name === 'AbortError') {
        throw new Error('Network timeout: 3000ms exceeded');
      }
      
      throw error;
    }
  }
}
