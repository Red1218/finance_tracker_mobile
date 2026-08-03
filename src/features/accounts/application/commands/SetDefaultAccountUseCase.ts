import { AccountId } from '../../domain';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { IUnitOfWork, InMemoryUnitOfWork } from '../../../../core/application/ports';
import { SetDefaultAccountCommand } from './SetDefaultAccountCommand';
import { AccountNotFoundError } from '../errors/AccountApplicationError';

export class SetDefaultAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly unitOfWork: IUnitOfWork = new InMemoryUnitOfWork()
  ) {
    Object.freeze(this);
  }

  public async execute(command: SetDefaultAccountCommand): Promise<void> {
    return await this.unitOfWork.runInTransaction(async () => {
      const accountId = new AccountId(command.accountId);

      const getResult = await this.accountRepository.getById(accountId);
      if (!getResult.success || !getResult.data) {
        throw new AccountNotFoundError(command.accountId);
      }

      const setDefaultResult = await this.accountRepository.setDefaultAccount(accountId);
      if (!setDefaultResult.success) {
        throw setDefaultResult.error;
      }
    });
  }
}
