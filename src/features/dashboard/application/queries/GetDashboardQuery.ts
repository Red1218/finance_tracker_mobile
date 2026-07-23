export interface GetDashboardQuery {
  readonly correlationId: string;
  readonly userId: string;
  readonly useCache?: boolean;
}
