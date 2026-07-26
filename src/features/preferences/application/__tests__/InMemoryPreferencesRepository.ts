import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { Preferences } from '../../domain';
import { Result, RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export class InMemoryPreferencesRepository implements IPreferencesRepository {
  private store: Map<string, Preferences> = new Map();
  private forceFailureMessage: string | null = null;

  public setForceFailure(message: string) {
    this.forceFailureMessage = message;
  }

  async get(userId?: string): Promise<RepositoryResult<Preferences | null, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    const key = userId ?? 'default';
    const found = this.store.get(key) ?? null;
    return Result.success(found);
  }

  async save(preferences: Preferences): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    const key = preferences.userId ?? 'default';
    this.store.set(key, preferences);
    return Result.success(undefined);
  }
}
