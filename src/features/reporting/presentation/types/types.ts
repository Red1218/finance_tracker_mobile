import { ReportingPeriod } from '../../domain';

export interface ReportingFiltersParams {
  reportingPeriod: ReportingPeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  categoryId?: string | null;
}
