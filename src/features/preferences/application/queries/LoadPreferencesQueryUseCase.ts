import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class LoadPreferencesQueryUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(userId?: string): Promise<PreferencesDTO> {
    const result = await this.preferencesRepository.get(userId);
    if (!result.success || !result.data) {
      throw new PreferencesNotFoundError();
    }

    return PreferencesDTOMapper.toDTO(result.data);
  }
}
