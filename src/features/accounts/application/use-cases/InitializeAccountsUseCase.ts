import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export class InitializeAccountsUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(): Promise<RepositoryResult<Account[], Error>> {
    const countResult = await this.accountRepository.getActiveCount();
    if (!countResult.success) {
      return countResult as RepositoryResult<never, Error>;
    }

    if (countResult.data === 0) {
      const defaultAccount = Account.createDefault();
      const saveResult = await this.accountRepository.save(defaultAccount);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }
    }

    return await this.accountRepository.getAll(false);
  }
}
