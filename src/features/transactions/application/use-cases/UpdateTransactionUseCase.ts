import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransactionDate,
  TransactionDomainError,
} from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export interface UpdateTransactionCommand {
  id: string;
  amount?: number;
  description?: string;
  categoryId?: string | null;
  transactionDate?: Date;
}

export class UpdateTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  public async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const tId = new TransactionId(command.id);
    const result = await this.transactionRepo.getById(tId);

    if (!result.success || !result.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', `Transaction "${command.id}" not found.`);
    }

    const transaction = result.data;

    if (transaction.isVoided) {
      throw new TransactionDomainError('INVALID_AMOUNT', 'Cannot modify a voided transaction.');
    }

    const updatedTransaction = transaction.updateDetails({
      amount: command.amount !== undefined ? new Money(command.amount) : undefined,
      description: command.description !== undefined ? new TransactionDescription(command.description) : undefined,
      categoryId: command.categoryId,
      transactionDate: command.transactionDate ? new TransactionDate(command.transactionDate) : undefined,
    });

    if (transaction.transferGroupId) {
      // Synchronize paired transfer entry if amount or date changes
      const transferPairResult = await this.transactionRepo.getByTransferGroupId(transaction.transferGroupId);
      if (transferPairResult.success && transferPairResult.data) {
        const pairedEntry = transferPairResult.data.find((t) => !t.id.equals(transaction.id));
        if (pairedEntry && !pairedEntry.isVoided) {
          const updatedPairedEntry = pairedEntry.updateDetails({
            amount: command.amount !== undefined ? new Money(command.amount) : undefined,
            description: command.description !== undefined ? new TransactionDescription(command.description) : undefined,
            transactionDate: command.transactionDate ? new TransactionDate(command.transactionDate) : undefined,
          });
          await this.transactionRepo.saveMany([updatedTransaction, updatedPairedEntry]);
          return updatedTransaction;
        }
      }
    }

    await this.transactionRepo.save(updatedTransaction);
    return updatedTransaction;
  }
}
