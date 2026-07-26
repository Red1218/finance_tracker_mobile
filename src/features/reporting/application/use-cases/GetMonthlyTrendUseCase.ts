import { IReportingRepository } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { MonthlyTrendResponse } from '../responses/MonthlyTrendResponse';
import { MonthlyTrendMapper } from '../mappers/MonthlyTrendMapper';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetMonthlyTrendUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<MonthlyTrendResponse>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const result = await this.reportingRepository.getMonthlyTrend(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate,
        request.categoryId
      );
      if (!result.success) return result;

      return Result.success(
        MonthlyTrendMapper.toResponse(result.data.points, result.data.previousPeriodTotal)
      );
    });
  }
}
