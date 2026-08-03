import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';

export class LoadAccountsQueryUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(includeArchivedOrQuery?: boolean | { includeArchived?: boolean }): Promise<AccountDTO[]> {
    const includeArchived = typeof includeArchivedOrQuery === 'object'
      ? includeArchivedOrQuery?.includeArchived ?? false
      : includeArchivedOrQuery ?? false;

    const result = await this.accountRepository.getAll(includeArchived);
    if (!result.success) {
      throw result.error;
    }
    return result.data.map((account) => AccountDTOMapper.toDTO(account));
  }
}
