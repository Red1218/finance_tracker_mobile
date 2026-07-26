import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { WeekStart, FinanceSettings, Preferences } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface UpdateWeekStartRequest {
  weekStart: WeekStart;
  userId?: string;
}

export class UpdateWeekStartUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(request: UpdateWeekStartRequest): Promise<RepositoryResult<Preferences, Error>> {
    const currentResult = await this.preferencesRepository.get(request.userId);
    if (!currentResult.success) {
      return currentResult as RepositoryResult<never, Error>;
    }

    const current = currentResult.data ?? Preferences.createDefault(undefined, request.userId);
    const updatedFinance = new FinanceSettings({
      currencyCode: current.finance.currencyCode,
      weekStart: request.weekStart,
      decimalPrecision: current.finance.decimalPrecision,
    });

    const updated = current.updateFinance(updatedFinance);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      return saveResult as RepositoryResult<never, Error>;
    }

    return Result.success(updated);
  }
}
