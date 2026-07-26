import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountId } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface LoadAccountRequest {
  accountId: string;
}

export class LoadAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: LoadAccountRequest): Promise<RepositoryResult<Account | null, Error>> {
    try {
      const accountId = new AccountId(request.accountId);
      return await this.accountRepository.getById(accountId);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
