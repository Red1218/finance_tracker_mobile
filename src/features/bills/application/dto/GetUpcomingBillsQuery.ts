export interface GetUpcomingBillsQuery {
  readonly userId: string;
  readonly windowDays?: number;
  readonly asOfDate?: Date;
}
