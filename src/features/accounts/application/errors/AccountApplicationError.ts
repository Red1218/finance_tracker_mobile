import { AccountDomainError } from '../../domain';

export class AccountApplicationError extends AccountDomainError {
  constructor(code: string, message: string) {
    super(code as any, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AccountNotFoundError extends AccountApplicationError {
  constructor(id: string) {
    super('ACCOUNT_NOT_FOUND', `Account with id "${id}" was not found.`);
  }
}

export class DuplicateAccountNameError extends AccountApplicationError {
  constructor(name: string) {
    super('DUPLICATE_ACCOUNT_NAME', `An active account named "${name}" already exists.`);
  }
}

export class LastAccountArchiveError extends AccountApplicationError {
  constructor() {
    super('LAST_ACTIVE_ACCOUNT_ARCHIVE', 'Cannot archive the sole remaining active account.');
  }
}
