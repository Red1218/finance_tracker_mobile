import { AccountId, CurrencyCode } from '../../../accounts/domain';
import { IAccountRepository } from '../../../accounts/application';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransactionDate,
  TransferReference,
  TransactionDomainError,
} from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export interface ExecuteTransferCommand {
  sourceTransactionId: string;
  destTransactionId: string;
  sourceAccountId: string;
  destAccountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  transferGroupId: string;
  transactionDate?: Date;
}

export class ExecuteTransferUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository
  ) {}

  public async execute(
    command: ExecuteTransferCommand
  ): Promise<{ sourceEntry: Transaction; destEntry: Transaction }> {
    const srcAccId = new AccountId(command.sourceAccountId);
    const destAccId = new AccountId(command.destAccountId);

    if (srcAccId.equals(destAccId)) {
      throw new TransactionDomainError(
        'SAME_SOURCE_DESTINATION_TRANSFER',
        'Source account and destination account cannot be identical.'
      );
    }

    const [srcResult, destResult] = await Promise.all([
      this.accountRepo.getById(srcAccId),
      this.accountRepo.getById(destAccId),
    ]);

    if (!srcResult.success || !srcResult.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', `Source account "${command.sourceAccountId}" not found.`);
    }
    const srcAccount = srcResult.data;
    if (srcAccount.isArchived) {
      throw new TransactionDomainError(
        'ARCHIVED_ACCOUNT_TRANSACTION_REJECTED',
        `Cannot execute transfer from archived account "${srcAccount.name.value}".`
      );
    }

    if (!destResult.success || !destResult.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', `Destination account "${command.destAccountId}" not found.`);
    }
    const destAccount = destResult.data;
    if (destAccount.isArchived) {
      throw new TransactionDomainError(
        'ARCHIVED_ACCOUNT_TRANSACTION_REJECTED',
        `Cannot execute transfer to archived account "${destAccount.name.value}".`
      );
    }

    const { sourceEntry, destEntry } = Transaction.createTransferPair({
      sourceTransactionId: new TransactionId(command.sourceTransactionId),
      destTransactionId: new TransactionId(command.destTransactionId),
      sourceAccountId: srcAccId,
      destAccountId: destAccId,
      amount: new Money(command.amount),
      currencyCode: new CurrencyCode(command.currencyCode),
      description: new TransactionDescription(command.description),
      transferGroupId: new TransferReference(command.transferGroupId),
      transactionDate: command.transactionDate ? new TransactionDate(command.transactionDate) : undefined,
    });

    // Atomic persistence of both entries
    await this.transactionRepo.saveMany([sourceEntry, destEntry]);

    return { sourceEntry, destEntry };
  }
}
