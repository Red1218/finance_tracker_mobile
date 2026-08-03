export class PreferencesApplicationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'PreferencesApplicationError';
    Object.setPrototypeOf(this, PreferencesApplicationError.prototype);
  }
}

export class PreferencesNotFoundError extends PreferencesApplicationError {
  constructor() {
    super('PREFERENCES_NOT_FOUND', 'User preferences were not found.');
    Object.setPrototypeOf(this, PreferencesNotFoundError.prototype);
  }
}

export class InvalidDecimalPrecisionError extends PreferencesApplicationError {
  constructor(val: number) {
    super('INVALID_DECIMAL_PRECISION', `Decimal precision must be an integer between 0 and 8. Received ${val}.`);
    Object.setPrototypeOf(this, InvalidDecimalPrecisionError.prototype);
  }
}
