import { AccountId, AccountName } from '../../domain';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { RenameAccountCommand } from './RenameAccountCommand';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';
import { AccountNotFoundError, DuplicateAccountNameError } from '../errors/AccountApplicationError';

export class RenameAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(command: RenameAccountCommand): Promise<AccountDTO> {
    const accountId = new AccountId(command.accountId);
    const getResult = await this.accountRepository.getById(accountId);

    if (!getResult.success || !getResult.data) {
      throw new AccountNotFoundError(command.accountId);
    }

    const existsResult = await this.accountRepository.existsByName(command.newName, command.accountId);
    if (existsResult.success && existsResult.data) {
      throw new DuplicateAccountNameError(command.newName);
    }

    const updatedAccount = getResult.data.rename(new AccountName(command.newName));
    const saveResult = await this.accountRepository.save(updatedAccount);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return AccountDTOMapper.toDTO(updatedAccount);
  }
}
