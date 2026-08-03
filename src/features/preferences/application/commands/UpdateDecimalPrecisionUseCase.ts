import { DecimalPrecision } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { UpdateDecimalPrecisionCommand } from './UpdateDecimalPrecisionCommand';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class UpdateDecimalPrecisionUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateDecimalPrecisionCommand): Promise<PreferencesDTO> {
    const getResult = await this.preferencesRepository.get();
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const updated = getResult.data.updateDecimalPrecision(command.decimalPrecision as DecimalPrecision);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
