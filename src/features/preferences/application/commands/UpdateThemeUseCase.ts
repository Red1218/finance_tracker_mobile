import { Theme } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { UpdateThemeCommand } from './UpdateThemeCommand';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class UpdateThemeUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateThemeCommand): Promise<PreferencesDTO> {
    const getResult = await this.preferencesRepository.get(command.userId);
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const updated = getResult.data.updateTheme(command.theme as Theme);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
