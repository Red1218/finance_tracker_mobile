import { IAccountRepository } from '../repositories/IAccountRepository';
import { AccountId } from '../../domain';
import { IUnitOfWork, InMemoryUnitOfWork } from '../../../../core/application/ports';
import { ArchiveAccountCommand } from './ArchiveAccountCommand';
import { AccountNotFoundError, LastAccountArchiveError } from '../errors/AccountApplicationError';

export class ArchiveAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly unitOfWork: IUnitOfWork = new InMemoryUnitOfWork()
  ) {
    Object.freeze(this);
  }

  public async execute(command: ArchiveAccountCommand): Promise<void> {
    return await this.unitOfWork.runInTransaction(async () => {
      const accountId = new AccountId(command.accountId);

      const getResult = await this.accountRepository.getById(accountId);
      if (!getResult.success || !getResult.data) {
        throw new AccountNotFoundError(command.accountId);
      }

      const account = getResult.data;
      if (account.isArchived) {
        return;
      }

      const activeCountResult = await this.accountRepository.getActiveCount();
      if (!activeCountResult.success) {
        throw activeCountResult.error;
      }

      if (activeCountResult.data <= 1) {
        throw new LastAccountArchiveError();
      }

      let nextDefaultAccountId: AccountId | undefined;

      if (account.isDefault) {
        const allActiveResult = await this.accountRepository.getAll(false);
        if (!allActiveResult.success) {
          throw allActiveResult.error;
        }

        const remainingActive = allActiveResult.data.filter((a) => !a.id.equals(accountId));
        remainingActive.sort((a, b) => {
          const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
          if (timeDiff !== 0) return timeDiff;
          return a.id.value.localeCompare(b.id.value);
        });

        if (remainingActive.length > 0) {
          nextDefaultAccountId = remainingActive[0].id;
        }
      }

      const archiveResult = await this.accountRepository.archiveAccount(accountId, nextDefaultAccountId);
      if (!archiveResult.success) {
        throw archiveResult.error;
      }
    });
  }
}
