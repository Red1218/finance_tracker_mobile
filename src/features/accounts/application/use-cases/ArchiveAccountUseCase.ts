import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountId, AccountDomainError } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface ArchiveAccountRequest {
  accountId: string;
}

export class ArchiveAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: ArchiveAccountRequest): Promise<RepositoryResult<void, Error>> {
    try {
      const accountId = new AccountId(request.accountId);

      const getResult = await this.accountRepository.getById(accountId);
      if (!getResult.success) {
        return getResult as RepositoryResult<never, Error>;
      }

      if (!getResult.data) {
        return Result.failure(new Error(`Account with id "${request.accountId}" not found.`));
      }

      const account = getResult.data;
      if (account.isArchived) {
        return Result.success(undefined);
      }

      const activeCountResult = await this.accountRepository.getActiveCount();
      if (!activeCountResult.success) {
        return activeCountResult as RepositoryResult<never, Error>;
      }

      if (activeCountResult.data <= 1) {
        return Result.failure(
          new AccountDomainError(
            'LAST_ACTIVE_ACCOUNT_ARCHIVE',
            'Cannot archive the sole active account.'
          )
        );
      }

      let nextDefaultAccountId: AccountId | undefined;

      if (account.isDefault) {
        const allActiveResult = await this.accountRepository.getAll(false);
        if (!allActiveResult.success) {
          return allActiveResult as RepositoryResult<never, Error>;
        }

        const remainingActive = allActiveResult.data.filter((a) => !a.id.equals(accountId));
        // Sort deterministically ORDER BY created_at ASC, id ASC
        remainingActive.sort((a, b) => {
          const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
          if (timeDiff !== 0) return timeDiff;
          return a.id.value.localeCompare(b.id.value);
        });

        if (remainingActive.length > 0) {
          nextDefaultAccountId = remainingActive[0].id;
        }
      }

      return await this.accountRepository.archiveAccount(accountId, nextDefaultAccountId);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
