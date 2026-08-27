import { Preferences } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';

export class InitializePreferencesUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(userId?: string): Promise<PreferencesDTO> {
    if (!userId || userId.trim() === '') {
      throw new Error('Unauthenticated user context: userId is required to initialize preferences.');
    }

    const existingResult = await this.preferencesRepository.get(userId);
    if (existingResult.success && existingResult.data) {
      return PreferencesDTOMapper.toDTO(existingResult.data);
    }

    const defaultPrefs = Preferences.createDefault(undefined, userId);
    const saveResult = await this.preferencesRepository.save(defaultPrefs);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(defaultPrefs);
  }
}
