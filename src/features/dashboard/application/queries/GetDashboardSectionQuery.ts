export interface GetDashboardSectionQuery {
  readonly correlationId: string;
  readonly userId: string;
  readonly sectionType: 'KPI' | 'BudgetHealth' | 'CategoryBreakdown' | 'RecentActivity';
  readonly useCache?: boolean;
}
