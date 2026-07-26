import { RepositoryError, RepositoryResult } from '../../../../platform/persistence';
import { Preferences } from '../../domain';

export interface IPreferencesRepository {
  get(userId?: string): Promise<RepositoryResult<Preferences | null, RepositoryError>>;
  save(preferences: Preferences): Promise<RepositoryResult<void, RepositoryError>>;
}
