import { AccountId } from '../../domain';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';
import { AccountNotFoundError } from '../errors/AccountApplicationError';

export class LoadAccountByIdQueryUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(accountIdOrQuery: string | { accountId: string }): Promise<AccountDTO> {
    const accountId = typeof accountIdOrQuery === 'string' ? accountIdOrQuery : accountIdOrQuery.accountId;
    const result = await this.accountRepository.getById(new AccountId(accountId));
    if (!result.success || !result.data) {
      throw new AccountNotFoundError(accountId);
    }
    return AccountDTOMapper.toDTO(result.data);
  }
}
