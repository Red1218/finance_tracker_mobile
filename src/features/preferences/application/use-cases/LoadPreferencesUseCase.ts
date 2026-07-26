import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { Preferences } from '../../domain';
import { RepositoryResult } from '../../../../platform/persistence';

export class LoadPreferencesUseCase {
  constructor(private readonly preferencesRepository: IPreferencesRepository) {
    Object.freeze(this);
  }

  public async execute(userId?: string): Promise<RepositoryResult<Preferences | null, Error>> {
    return await this.preferencesRepository.get(userId);
  }
}
