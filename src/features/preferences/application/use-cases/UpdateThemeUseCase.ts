import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { Theme, AppearanceSettings, Preferences } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface UpdateThemeRequest {
  theme: Theme;
  userId?: string;
}

export class UpdateThemeUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(request: UpdateThemeRequest): Promise<RepositoryResult<Preferences, Error>> {
    const currentResult = await this.preferencesRepository.get(request.userId);
    if (!currentResult.success) {
      return currentResult as RepositoryResult<never, Error>;
    }

    const current = currentResult.data ?? Preferences.createDefault(undefined, request.userId);
    const updated = current.updateAppearance(new AppearanceSettings({ theme: request.theme }));

    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      return saveResult as RepositoryResult<never, Error>;
    }

    return Result.success(updated);
  }
}
