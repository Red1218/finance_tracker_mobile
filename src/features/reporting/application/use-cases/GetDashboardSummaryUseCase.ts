import { IReportingRepository } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { DashboardSummaryResponse } from '../responses/DashboardSummaryResponse';
import { DashboardSummaryMapper } from '../mappers/DashboardSummaryMapper';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetDashboardSummaryUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<DashboardSummaryResponse>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const result = await this.reportingRepository.getDashboardSummary(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate
      );
      if (!result.success) return result;

      return Result.success(DashboardSummaryMapper.toResponse(result.data));
    });
  }
}
