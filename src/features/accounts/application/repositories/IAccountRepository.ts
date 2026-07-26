import { RepositoryError, RepositoryResult } from '../../../../platform/persistence';
import { Account, AccountId } from '../../domain';

export interface IAccountRepository {
  getById(id: AccountId): Promise<RepositoryResult<Account | null, RepositoryError>>;
  getAll(includeArchived?: boolean): Promise<RepositoryResult<Account[], RepositoryError>>;
  getDefault(): Promise<RepositoryResult<Account | null, RepositoryError>>;
  save(account: Account): Promise<RepositoryResult<void, RepositoryError>>;
  setDefaultAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>>;
  archiveAccount(accountId: AccountId, nextDefaultAccountId?: AccountId): Promise<RepositoryResult<void, RepositoryError>>;
  restoreAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>>;
  existsByName(name: string, excludeAccountId?: string): Promise<RepositoryResult<boolean, RepositoryError>>;
  getActiveCount(): Promise<RepositoryResult<number, RepositoryError>>;
}
