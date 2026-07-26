import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../../domain';
import { RepositoryResult } from '../../../../platform/persistence';

export interface LoadAccountsRequest {
  includeArchived?: boolean;
}

export class LoadAccountsUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: LoadAccountsRequest = {}): Promise<RepositoryResult<Account[], Error>> {
    return await this.accountRepository.getAll(request.includeArchived ?? false);
  }
}
