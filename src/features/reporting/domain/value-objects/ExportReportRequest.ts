import { ReportingDomainError } from '../errors/ReportingDomainError';

export type ExportFormat = 'pdf' | 'csv';

export class ExportReportRequest {
  public readonly format: ExportFormat;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly categoryId: string | null;

  constructor(props: {
    format: ExportFormat;
    startDate: Date;
    endDate: Date;
    categoryId?: string | null;
  }) {
    if (!props.format || (props.format !== 'pdf' && props.format !== 'csv')) {
      throw new ReportingDomainError('INVALID_REPORTING_PERIOD', 'Invalid export format.');
    }

    if (!props.startDate || !props.endDate || isNaN(props.startDate.getTime()) || isNaN(props.endDate.getTime())) {
      throw new ReportingDomainError('INVALID_REPORTING_PERIOD', 'Invalid export date range.');
    }

    if (props.startDate.getTime() > props.endDate.getTime()) {
      throw new ReportingDomainError('INVALID_REPORTING_PERIOD', 'Export start date cannot be after end date.');
    }

    this.format = props.format;
    this.startDate = new Date(props.startDate.getTime());
    this.endDate = new Date(props.endDate.getTime());
    this.categoryId = props.categoryId ?? null;

    Object.freeze(this);
  }
}
