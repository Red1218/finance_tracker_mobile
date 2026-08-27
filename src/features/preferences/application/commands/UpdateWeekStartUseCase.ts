import { WeekStart } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { UpdateWeekStartCommand } from './UpdateWeekStartCommand';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class UpdateWeekStartUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateWeekStartCommand): Promise<PreferencesDTO> {
    const getResult = await this.preferencesRepository.get(command.userId);
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const updated = getResult.data.updateWeekStart(command.weekStart as WeekStart);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
