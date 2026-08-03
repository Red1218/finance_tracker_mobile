import { CurrencyCode } from '../../../accounts/domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { UpdateCurrencyCommand } from './UpdateCurrencyCommand';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class UpdateCurrencyUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(command: UpdateCurrencyCommand): Promise<PreferencesDTO> {
    const getResult = await this.preferencesRepository.get();
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const updated = getResult.data.updateCurrency(new CurrencyCode(command.currencyCode));
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
