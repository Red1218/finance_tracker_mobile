import { AccountId, CurrencyCode } from '../../../accounts/domain';
import { IAccountRepository } from '../../../accounts/application/repositories/IAccountRepository';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransferReference,
} from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IUnitOfWork, InMemoryUnitOfWork } from '../../../../core/application/ports';
import { ExecuteTransferCommand } from './ExecuteTransferCommand';
import { TransactionDTO } from '../dto/TransactionDTO';
import { TransactionDTOMapper } from '../mappers/TransactionDTOMapper';
import { AccountNotFoundError } from '../../../accounts/application/errors/AccountApplicationError';
import { SameAccountTransferError } from '../errors/TransactionApplicationError';
import { generateUUID } from '../../../../core/utils/uuid';

export class ExecuteTransferUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository,
    private readonly unitOfWork: IUnitOfWork = new InMemoryUnitOfWork()
  ) {
    Object.freeze(this);
  }

  public async execute(
    command: ExecuteTransferCommand
  ): Promise<{ sourceEntry: TransactionDTO; destEntry: TransactionDTO }> {
    return await this.unitOfWork.runInTransaction(async () => {
      const srcAccId = new AccountId(command.sourceAccountId);
      const destAccId = new AccountId(command.destAccountId);

      if (srcAccId.equals(destAccId)) {
        throw new SameAccountTransferError();
      }

      const [srcResult, destResult] = await Promise.all([
        this.accountRepo.getById(srcAccId),
        this.accountRepo.getById(destAccId),
      ]);

      if (!srcResult.success || !srcResult.data) {
        throw new AccountNotFoundError(command.sourceAccountId);
      }
      const srcAccount = srcResult.data;

      if (!destResult.success || !destResult.data) {
        throw new AccountNotFoundError(command.destAccountId);
      }
      const destAccount = destResult.data;

      const { sourceEntry, destEntry } = Transaction.createTransferPair({
        sourceTransactionId: new TransactionId(command.sourceTransactionId || generateUUID()),
        destTransactionId: new TransactionId(command.destTransactionId || generateUUID()),
        sourceAccountId: srcAccId,
        destAccountId: destAccId,
        amount: new Money(command.amount),
        currencyCode: new CurrencyCode(command.currencyCode),
        description: new TransactionDescription(command.description),
        transferGroupId: new TransferReference(command.transferGroupId || generateUUID()),

        transactionDate: command.transactionDate ? (command.transactionDate as any) : undefined,
      });

      const saveResult = await this.transactionRepo.saveMany([sourceEntry, destEntry]);
      if (!saveResult.success) {
        throw saveResult.error;
      }

      return {
        sourceEntry: TransactionDTOMapper.toDTO(sourceEntry),
        destEntry: TransactionDTOMapper.toDTO(destEntry),
      };
    });
  }
}
