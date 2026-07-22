import { IReportingRepository } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { BudgetPerformanceResponse } from '../responses/BudgetPerformanceResponse';
import { BudgetPerformanceMapper } from '../mappers/BudgetPerformanceMapper';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetBudgetPerformanceUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<BudgetPerformanceResponse>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const result = await this.reportingRepository.getBudgetPerformance(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate
      );
      if (!result.success) return result;

      return Result.success(BudgetPerformanceMapper.toResponse(result.data));
    });
  }
}
