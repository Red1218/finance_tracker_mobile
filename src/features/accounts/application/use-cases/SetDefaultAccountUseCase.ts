import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountId, AccountDomainError } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface SetDefaultAccountRequest {
  accountId: string;
}

export class SetDefaultAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: SetDefaultAccountRequest): Promise<RepositoryResult<void, Error>> {
    try {
      const accountId = new AccountId(request.accountId);

      const getResult = await this.accountRepository.getById(accountId);
      if (!getResult.success) {
        return getResult as RepositoryResult<never, Error>;
      }

      if (!getResult.data) {
        return Result.failure(new Error(`Account with id "${request.accountId}" not found.`));
      }

      if (getResult.data.isArchived) {
        return Result.failure(
          new AccountDomainError(
            'ARCHIVED_ACCOUNT_MODIFICATION',
            'Cannot set an archived account as default.'
          )
        );
      }

      return await this.accountRepository.setDefaultAccount(accountId);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
