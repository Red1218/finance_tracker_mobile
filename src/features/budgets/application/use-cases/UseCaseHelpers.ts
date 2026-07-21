import { Result } from '../../../../platform/persistence';
import { UseCaseResult } from './UseCaseTypes';

export async function executeUseCase<T>(
  action: () => Promise<UseCaseResult<T>>
): Promise<UseCaseResult<T>> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure(error);
    }
    return Result.failure(new Error('Unknown application error'));
  }
}
