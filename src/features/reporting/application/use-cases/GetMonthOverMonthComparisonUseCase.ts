import { IReportingRepository, MonthOverMonthComparison } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';

export class GetMonthOverMonthComparisonUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<MonthOverMonthComparison>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      return await this.reportingRepository.getMonthOverMonthComparison(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate,
        request.categoryId
      );
    });
  }
}
