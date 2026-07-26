import { TransactionId, TransactionDomainError } from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export class VoidTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  public async execute(id: string, voidedAt: Date = new Date()): Promise<void> {
    const tId = new TransactionId(id);
    const result = await this.transactionRepo.getById(tId);

    if (!result.success || !result.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', `Transaction "${id}" not found.`);
    }

    const transaction = result.data;

    if (transaction.transferGroupId) {
      // Void both entries in the transfer pair
      const voidResult = await this.transactionRepo.voidTransferGroup(transaction.transferGroupId, voidedAt);
      if (!voidResult.success) throw voidResult.error;
    } else {
      const voidResult = await this.transactionRepo.voidTransaction(tId, voidedAt);
      if (!voidResult.success) throw voidResult.error;
    }
  }
}
