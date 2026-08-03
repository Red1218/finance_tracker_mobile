import { TransactionId, TransactionDomainError } from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export class VoidTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  public async execute(
    idOrCommand: string | { transactionId?: string; id?: string; voidedAt?: Date },
    voidedAt?: Date
  ): Promise<void> {
    let targetId: string;
    let effectiveVoidedAt: Date = voidedAt ?? new Date();

    if (typeof idOrCommand === 'string') {
      targetId = idOrCommand;
    } else if (idOrCommand && typeof idOrCommand === 'object') {
      targetId = (idOrCommand.transactionId || idOrCommand.id)!;
      if (idOrCommand.voidedAt) {
        effectiveVoidedAt = idOrCommand.voidedAt;
      }
    } else {
      throw new TransactionDomainError('INVALID_TRANSACTION_ID' as any, 'Transaction ID is required.');
    }

    const tId = new TransactionId(targetId);
    const result = await this.transactionRepo.getById(tId);

    if (!result.success || !result.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND' as any, `Transaction "${targetId}" not found.`);
    }

    const transaction = result.data;

    if (transaction.transferGroupId) {
      const rawGroupId = typeof transaction.transferGroupId === 'object'
        ? (transaction.transferGroupId as any).value
        : transaction.transferGroupId;
      const voidResult = await this.transactionRepo.voidTransferGroup(rawGroupId as any, effectiveVoidedAt);
      if (!voidResult.success) throw voidResult.error;
    } else {
      const voidResult = await this.transactionRepo.voidTransaction(tId, effectiveVoidedAt);
      if (!voidResult.success) throw voidResult.error;
    }
  }
}
