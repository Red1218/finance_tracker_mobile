import { IReportingRepository } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';
import { LargestTransactionsResponse } from '../responses/LargestTransactionsResponse';
import { LargestTransactionsMapper } from '../mappers/LargestTransactionsMapper';
import { ReportingUseCaseResult, validateReportingRequest, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export class GetLargestTransactionsUseCase {
  constructor(private readonly reportingRepository: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(request: ReportingRequest): Promise<ReportingUseCaseResult<LargestTransactionsResponse>> {
    return executeReportingUseCase(async () => {
      const validation = validateReportingRequest(request);
      if (!validation.success) return validation;

      const result = await this.reportingRepository.getLargestTransactions(
        request.reportingPeriod,
        validation.data.startDate,
        validation.data.endDate
      );
      if (!result.success) return result;

      return Result.success(LargestTransactionsMapper.toResponse(result.data));
    });
  }
}
