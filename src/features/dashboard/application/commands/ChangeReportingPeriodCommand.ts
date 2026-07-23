export interface ChangeReportingPeriodCommand {
  readonly correlationId: string;
  readonly userId: string;
  readonly periodType: 'CURRENT_MONTH' | 'LAST_MONTH' | 'CUSTOM';
  readonly customStartDate?: Date;
  readonly customEndDate?: Date;
}
