import { Preferences } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';

export class InitializePreferencesUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(userId?: string): Promise<PreferencesDTO> {
    const existingResult = await this.preferencesRepository.get();
    if (existingResult.success && existingResult.data) {
      return PreferencesDTOMapper.toDTO(existingResult.data);
    }

    const defaultPrefs = Preferences.createDefault();
    const saveResult = await this.preferencesRepository.save(defaultPrefs);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(defaultPrefs);
  }
}
