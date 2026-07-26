import { PreferencesDomainError } from '../errors/PreferencesDomainError';

export class ReminderTime {
  private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
  public readonly value: string;

  constructor(timeStr: string) {
    const formatted = timeStr.trim();
    if (!ReminderTime.TIME_REGEX.test(formatted)) {
      throw new PreferencesDomainError(
        'INVALID_REMINDER_TIME',
        `Invalid reminder time format: "${timeStr}". Must be 24-hour HH:MM format (e.g. 20:00).`
      );
    }

    this.value = formatted;
    Object.freeze(this);
  }

  public equals(other: ReminderTime): boolean {
    return this.value === other.value;
  }
}
