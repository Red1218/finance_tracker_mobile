export interface LoadDashboardCommand {
  readonly correlationId: string;
  readonly userId: string;
  readonly reportingPeriodId?: string; // Optional: if absent, load the active or default period
}
