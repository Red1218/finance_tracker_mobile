export interface RefreshSectionCommand {
  readonly correlationId: string;
  readonly userId: string;
  readonly sectionType: 'KPI' | 'BudgetHealth' | 'CategoryBreakdown' | 'RecentActivity';
}
