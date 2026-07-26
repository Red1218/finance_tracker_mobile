import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountId } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface RestoreAccountRequest {
  accountId: string;
}

export class RestoreAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: RestoreAccountRequest): Promise<RepositoryResult<void, Error>> {
    try {
      const accountId = new AccountId(request.accountId);
      return await this.accountRepository.restoreAccount(accountId);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
