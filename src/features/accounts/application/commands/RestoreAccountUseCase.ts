import { AccountId } from '../../domain';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { RestoreAccountCommand } from './RestoreAccountCommand';
import { AccountNotFoundError } from '../errors/AccountApplicationError';

export class RestoreAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreAccountCommand): Promise<void> {
    const accountId = new AccountId(command.accountId);
    const getResult = await this.accountRepository.getById(accountId);

    if (!getResult.success || !getResult.data) {
      throw new AccountNotFoundError(command.accountId);
    }

    const restoreResult = await this.accountRepository.restoreAccount(accountId);
    if (!restoreResult.success) {
      throw restoreResult.error;
    }
  }
}
