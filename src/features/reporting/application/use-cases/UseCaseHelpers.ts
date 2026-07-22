import { RepositoryResult, RepositoryError, Result } from '../../../../platform/persistence';
import { ReportingPeriod } from '../../domain';
import { ReportingRequest } from '../requests/ReportingRequest';

export type ReportingApplicationError = RepositoryError | Error;
export type ReportingUseCaseResult<T = void> = RepositoryResult<T, ReportingApplicationError>;

/**
 * Shared validation for all reporting use cases.
 * Enforces the CUSTOM period contract: both dates required, start before end.
 */
export function validateReportingRequest(
  request: ReportingRequest
): ReportingUseCaseResult<{ startDate?: Date; endDate?: Date }> {
  if (request.reportingPeriod === ReportingPeriod.CUSTOM) {
    if (!request.customStartDate || !request.customEndDate) {
      return Result.failure(
        new Error('customStartDate and customEndDate are required when reportingPeriod is CUSTOM.')
      );
    }
    if (request.customStartDate >= request.customEndDate) {
      return Result.failure(
        new Error('customStartDate must be before customEndDate.')
      );
    }
    return Result.success({ startDate: request.customStartDate, endDate: request.customEndDate });
  }
  return Result.success({});
}

/**
 * Reuses the same try/catch pattern from the Budgets feature's executeUseCase helper.
 */
export async function executeReportingUseCase<T>(
  action: () => Promise<ReportingUseCaseResult<T>>
): Promise<ReportingUseCaseResult<T>> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure(error);
    }
    return Result.failure(new Error('Unknown reporting application error'));
  }
}
