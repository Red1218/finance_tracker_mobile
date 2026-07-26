import { PreferencesDomainError } from '../errors/PreferencesDomainError';

export class PreferencesId {
  public readonly value: string;

  constructor(id: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new PreferencesDomainError(
        'INVALID_IDENTIFIER',
        'Preferences identifier cannot be empty.'
      );
    }

    this.value = id.trim();
    Object.freeze(this);
  }

  public equals(other: PreferencesId): boolean {
    return this.value === other.value;
  }
}
