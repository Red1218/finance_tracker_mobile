import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { CurrencyCode, FinanceSettings, Preferences } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface UpdateCurrencyRequest {
  currencyCode: string;
  userId?: string;
}

export class UpdateCurrencyUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(request: UpdateCurrencyRequest): Promise<RepositoryResult<Preferences, Error>> {
    try {
      const currencyCode = new CurrencyCode(request.currencyCode);
      const currentResult = await this.preferencesRepository.get(request.userId);
      if (!currentResult.success) {
        return currentResult as RepositoryResult<never, Error>;
      }

      const current = currentResult.data ?? Preferences.createDefault(undefined, request.userId);
      const updatedFinance = new FinanceSettings({
        currencyCode,
        weekStart: current.finance.weekStart,
        decimalPrecision: current.finance.decimalPrecision,
      });

      const updated = current.updateFinance(updatedFinance);
      const saveResult = await this.preferencesRepository.save(updated);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }

      return Result.success(updated);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
