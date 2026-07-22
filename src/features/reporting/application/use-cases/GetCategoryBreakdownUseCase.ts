import { IReportingRepository } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { CategoryBreakdownResponse } from '../responses/CategoryBreakdownResponse';
import { CategoryBreakdownMapper } from '../mappers/CategoryBreakdownMapper';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetCategoryBreakdownUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<CategoryBreakdownResponse>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const result = await this.reportingRepository.getCategoryBreakdown(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate
      );
      if (!result.success) return result;

      return Result.success(CategoryBreakdownMapper.toResponse(result.data));
    });
  }
}
