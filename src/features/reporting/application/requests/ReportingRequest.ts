import { ReportingPeriod } from '../../domain';

export interface ReportingRequest {
  readonly reportingPeriod: ReportingPeriod;
  readonly customStartDate?: Date;
  readonly customEndDate?: Date;
  readonly categoryId?: string | null;
}
