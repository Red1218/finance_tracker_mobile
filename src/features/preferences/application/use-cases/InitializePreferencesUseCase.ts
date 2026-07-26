import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { Preferences } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export class InitializePreferencesUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(userId?: string): Promise<RepositoryResult<Preferences, Error>> {
    const existingResult = await this.preferencesRepository.get(userId);
    if (!existingResult.success) {
      return existingResult as RepositoryResult<never, Error>;
    }

    if (existingResult.data) {
      return Result.success(existingResult.data);
    }

    const defaultPreferences = Preferences.createDefault(undefined, userId);
    const saveResult = await this.preferencesRepository.save(defaultPreferences);
    if (!saveResult.success) {
      return saveResult as RepositoryResult<never, Error>;
    }

    return Result.success(defaultPreferences);
  }
}
