import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountId, AccountName, AccountDomainError } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface RenameAccountRequest {
  accountId: string;
  newName: string;
}

export class RenameAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: RenameAccountRequest): Promise<RepositoryResult<Account, Error>> {
    try {
      const accountId = new AccountId(request.accountId);
      const newName = new AccountName(request.newName);

      const existsResult = await this.accountRepository.existsByName(newName.value, accountId.value);
      if (!existsResult.success) {
        return existsResult as RepositoryResult<never, Error>;
      }

      if (existsResult.data) {
        return Result.failure(
          new AccountDomainError(
            'DUPLICATE_ACCOUNT_NAME',
            `An active account with name "${newName.value}" already exists.`
          )
        );
      }

      const getResult = await this.accountRepository.getById(accountId);
      if (!getResult.success) {
        return getResult as RepositoryResult<never, Error>;
      }

      if (!getResult.data) {
        return Result.failure(new Error(`Account with id "${request.accountId}" not found.`));
      }

      const renamedAccount = getResult.data.rename(newName);
      const saveResult = await this.accountRepository.save(renamedAccount);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }

      return Result.success(renamedAccount);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
