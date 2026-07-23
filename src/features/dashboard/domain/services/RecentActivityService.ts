import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';

export class RecentActivityService {
  /**
   * Sorts and limits transactions to return recent activity.
   */
  public getRecentActivity(
    transactions: TransactionSnapshot[],
    limit: number = 5
  ): TransactionSnapshot[] {
    return [...transactions]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, Math.max(0, limit));
  }
}
